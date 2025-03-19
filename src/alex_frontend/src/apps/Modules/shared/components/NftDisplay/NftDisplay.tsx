import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { Transaction, Tag } from '@/apps/Modules/shared/types/queries';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { ALEX } from '../../../../../../../declarations/ALEX';
import { LBRY } from '../../../../../../../declarations/LBRY';
import { nft_manager } from '../../../../../../../declarations/nft_manager';
import { setContentData } from '@/apps/Modules/shared/state/transactions/transactionSlice';
import { setNFTs, updateNftBalances } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import ContentRenderer from '@/apps/Modules/AppModules/safeRender/ContentRenderer';
import { createTokenAdapter, determineTokenType, TokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { convertE8sToToken } from '@/apps/Modules/shared/utils/tokenUtils';
import { getNftOwnerInfo } from '@/apps/Modules/shared/utils/nftOwner';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { fetchTransactionById } from '@/apps/Modules/LibModules/arweaveSearch/api/directArweaveClient';
import { NftDisplayProps } from './types';
import NftFooter from './NftFooter';

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

/**
 * Universal NFT Display Component
 * 
 * A flexible component for displaying NFTs consistently across the application.
 * Supports different display densities, data loading strategies, and customizable features.
 */
const NftDisplay: React.FC<NftDisplayProps> = ({
  tokenId,
  variant = 'compact',
  aspectRatio = 1, // Default to 1:1 ratio
  inShelf = false,
  inModal = false,
  loadingStrategy = 'direct',
  arweaveId,
  transaction: providedTransaction,
  onClick,
  onViewDetails,
  showFooter = true,
  showCopyControls = true,
  showOwnerInfo = true,
  showBalances = true
}) => {
  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [contentUrls, setContentUrls] = useState<any>(null);
  const [ownerInfo, setOwnerInfo] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Redux state
  const dispatch = useDispatch<AppDispatch>();
  const contentData = useSelector((state: RootState) => state.transactions.contentData);
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const { user } = useSelector((state: RootState) => state.auth);

  // Intelligent data loading
  useEffect(() => {
    let mounted = true;

    async function loadNFTData() {
      if (!tokenId) return;

      try {
        setIsLoading(true);
        
        // Strategy 1: Use provided transaction if available
        if (loadingStrategy === 'provided' && providedTransaction) {
          setTransaction(providedTransaction);
          
          // Still need to get content URLs
          const content = await ContentService.loadContent(providedTransaction);
          const urls = await ContentService.getContentUrls(providedTransaction, content);
          
          if (mounted) {
            setContentUrls(urls);
            
            // Store in Redux for caching
            dispatch(setContentData({ 
              id: providedTransaction.id, 
              content: {
                ...content,
                urls
              }
            }));
          }
          
          return;
        }
        
        // Strategy 2: Use Redux data if available
        if (loadingStrategy === 'redux') {
          const storedNft = nfts[tokenId];
          
          if (storedNft?.arweaveId) {
            const reduxTransaction = transactions.find((t: Transaction) => t.id === storedNft.arweaveId);
            const reduxContent = reduxTransaction ? contentData[reduxTransaction.id] : null;
            
            if (reduxTransaction && reduxContent) {
              if (mounted) {
                setTransaction(reduxTransaction);
                setContentUrls(reduxContent.urls);
                return;
              }
            }
          }
        }
        
        // Strategy 3: Direct loading (fallback)
        const tokenType = determineTokenType(tokenId);
        const tokenAdapter = createTokenAdapter(tokenType);
        const nftId = BigInt(tokenId);
        
        // Handle SBT original ID
        let ogId: bigint;
        if (tokenType === 'SBT') {
          ogId = await nft_manager.scion_to_og_id(nftId);
        } else {
          ogId = nftId;
        }
        
        // Get Arweave ID for this token
        const nftArweaveId = arweaveId || 
          await tokenAdapter.tokenToNFTData(nftId, '').then(data => data.arweaveId);
        
        // Ensure arweaveId is defined before proceeding
        if (!nftArweaveId) {
          if (mounted) {
            setError('Failed to retrieve NFT metadata');
            setIsLoading(false);
          }
          return;
        }
        
        // Fetch transaction data from Arweave
        const txData = await fetchTransactionById(nftArweaveId);
        
        if (!txData) {
          if (mounted) {
            setError('NFT data not found');
            setIsLoading(false);
          }
          return;
        }
        
        if (mounted) {
          setTransaction(txData);
          
          // Load content and URLs
          const content = await ContentService.loadContent(txData);
          const urls = await ContentService.getContentUrls(txData, content);
          setContentUrls(urls);
          
          // Set content in Redux store
          dispatch(setContentData({ 
            id: txData.id, 
            content: {
              ...content,
              urls
            }
          }));
        }

        // Get NFT owner info if requested
        if (showOwnerInfo) {
          try {
            const info = await getNftOwnerInfo(tokenId);
            if (mounted) {
              setOwnerInfo(info);
            }
          } catch (error) {
            console.error('Failed to load owner info:', error);
          }
        }

        // Get balances for this NFT if we need to show them
        if (showBalances) {
          try {
            const subaccount = await nft_manager.to_nft_subaccount(nftId);
            const balanceParams = {
              owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
              subaccount: [Array.from(subaccount)] as [number[]]
            };

            const [alexBalance, lbryBalance] = await Promise.all([
              ALEX.icrc1_balance_of(balanceParams),
              LBRY.icrc1_balance_of(balanceParams)
            ]);

            if (mounted) {
              const alexTokens = convertE8sToToken(alexBalance);
              const lbryTokens = convertE8sToToken(lbryBalance);

              // Update NFT data in Redux store with safe arweaveId
              dispatch(setNFTs({
                [tokenId]: {
                  collection: tokenType,
                  principal: ownerInfo?.principal || '',
                  arweaveId: nftArweaveId,
                  balances: { alex: alexTokens, lbry: lbryTokens }
                }
              }));
              
              dispatch(updateNftBalances({
                tokenId,
                alex: alexTokens,
                lbry: lbryTokens,
                collection: tokenType
              }));
            }
          } catch (error) {
            console.error('Failed to load NFT balances:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load NFT:', error);
        if (mounted) {
          setError('Failed to load NFT data');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    
    loadNFTData();
    
    return () => {
      mounted = false;
    };
  }, [tokenId, arweaveId, providedTransaction, loadingStrategy, dispatch, showOwnerInfo, showBalances, transactions, nfts, contentData]);

  // Error handler for ContentRenderer
  const handleRenderError = () => {
    if (transaction) {
      ContentService.clearTransaction(transaction.id);
    }
  };

  // Handle click events
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (onViewDetails) {
      onViewDetails(tokenId);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center ${
        variant === 'full' ? 'h-96' : 'h-full'
      } text-muted-foreground p-4`}>
        <svg className="animate-spin h-8 w-8 mb-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs text-center">Loading NFT...</span>
      </div>
    );
  }

  // Error state
  if (error || !transaction || !contentUrls) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4">
        {error || 'NFT content not available'}
      </div>
    );
  }

  // Get data from Redux store if available
  const nftData = nfts[tokenId];
  const content = contentData[transaction.id];
  
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4">
        Content not found
      </div>
    );
  }

  // Render content based on variant
  const renderContent = () => {
    switch (variant) {
      case 'full':
        return (
          <div className="w-full">
            <ContentRenderer
              transaction={transaction}
              content={content}
              contentUrls={contentUrls}
              handleRenderError={handleRenderError}
              inModal={inModal}
            />
          </div>
        );
      
      case 'grid':
        return (
          <div className="w-full h-full flex items-center justify-center bg-muted/10">
            <ContentRenderer
              transaction={transaction}
              content={content}
              contentUrls={contentUrls}
              handleRenderError={handleRenderError}
              inModal={false}
            />
          </div>
        );
      
      case 'compact':
      default:
        return (
          <ContentRenderer
            transaction={transaction}
            content={content}
            contentUrls={contentUrls}
            handleRenderError={handleRenderError}
            inModal={false}
          />
        );
    }
  };

  return (
    <div 
      className={`flex flex-col ${variant === 'full' ? 'p-4' : ''}`}
      onClick={handleClick}
      style={{ cursor: (onClick || onViewDetails) ? 'pointer' : 'default' }}
    >
      {/* NFT Content Display */}
      <div 
        className={`relative overflow-hidden rounded-md border border-border ${
          variant === 'full' ? 'w-full max-w-3xl mx-auto' : ''
        }`}
        style={{ aspectRatio: aspectRatio.toString() }}
      >
        {renderContent()}
      </div>
      
      {/* NFT Footer */}
      {showFooter && (
        <NftFooter
          tokenId={tokenId}
          nftData={nftData}
          ownerInfo={ownerInfo}
          transaction={transaction}
          showCopyControls={showCopyControls}
          showBalances={showBalances}
          compact={variant === 'grid'}
        />
      )}
    </div>
  );
};

export default NftDisplay; 