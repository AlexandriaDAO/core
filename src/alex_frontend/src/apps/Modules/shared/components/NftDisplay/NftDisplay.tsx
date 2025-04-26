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

  // Normalize providedTransaction for dependency array
  const transactionDependency = providedTransaction ?? undefined;

  // Intelligent data loading
  useEffect(() => {
    let mounted = true;

    async function loadNFTData() {
      if (!tokenId) {
        setError('Token ID is missing');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Check Redux first (most efficient)
        const storedNft = nfts[tokenId];
        // Prioritize provided arweaveId, then Redux arweaveId, then mapping from id prop if available
        const storedArweaveId = arweaveId || storedNft?.arweaveId || (tokenId ? arweaveToNftId[tokenId] : undefined);
        let potentialTransaction = providedTransaction;

        // Find transaction in Redux if not provided
        if (!potentialTransaction && storedArweaveId) {
           potentialTransaction = transactions.find((t: Transaction) => t.id === storedArweaveId);
        }
        
        const potentialContent = potentialTransaction ? contentData[potentialTransaction.id] : null;

        // Case 1: Have NFT, Transaction, and Content URLs in Redux/Props
        if (storedNft && potentialTransaction && potentialContent?.urls) {
          console.log('[NftDisplay] Using existing data for token:', tokenId);
          setTransaction(potentialTransaction);
          setContentUrls(potentialContent.urls);
          
          // Fetch owner only if needed and not already present in component state
          if (showOwnerInfo && !ownerInfo) { 
             getNftOwnerInfo(tokenId).then(info => mounted && setOwnerInfo(info)).catch(err => console.error('Failed to load owner info:', err));
          }
          // Fetch balances only if needed and not present in Redux NFT data
          if (showBalances && (!storedNft.balances || Object.keys(storedNft.balances).length === 0)) {
             fetchNftBalances(tokenId, storedNft.collection, mounted, dispatch);
          }
          setIsLoading(false);
          return; // Data is sufficient
        }
        
        // Case 2: Data is incomplete, need to fetch
        console.log('[NftDisplay] Fetching required data for token:', tokenId);
        const tokenType = determineTokenType(tokenId);
        const tokenAdapter = createTokenAdapter(tokenType);
        const nftId = BigInt(tokenId);
        
        // Determine the Arweave ID to use for fetching
        let currentArweaveId = storedArweaveId;
        if (!currentArweaveId) {
           // Fetch metadata only if Arweave ID wasn't found via props or Redux
           console.log('[NftDisplay] Fetching Arweave ID from tokenAdapter for token:', tokenId);
           const nftMetaData = await tokenAdapter.tokenToNFTData(nftId, '');
           currentArweaveId = nftMetaData.arweaveId;
        }

        if (!currentArweaveId) {
          throw new Error('Failed to retrieve Arweave ID for NFT metadata');
        }

        // Initialize finalTransaction explicitly as Transaction | null
        let finalTransaction: Transaction | null = potentialTransaction ?? null;

        // Fetch transaction only if we don't have one yet
        if (!finalTransaction) {
           console.log('[NftDisplay] Fetching transaction from Arweave:', currentArweaveId);
           const fetchedTx: Transaction | null = await fetchTransactionById(currentArweaveId);
           if (fetchedTx) { // Assign only if fetch returned a transaction
              finalTransaction = fetchedTx;
           } 
           // If fetchedTx was null, finalTransaction remains null
        }
        
        // Now, if finalTransaction is still null here, we couldn't get transaction data
        if (!finalTransaction) {
          throw new Error('NFT Arweave data not found after fetch attempt');
        }
        
        // Fetch content/URLs if needed (if not found in Redux)
        let finalContentUrls = potentialContent?.urls;
        if (!finalContentUrls) {
            console.log('[NftDisplay] Loading content from ContentService for transaction:', finalTransaction.id);
            const content = await ContentService.loadContent(finalTransaction);
            finalContentUrls = await ContentService.getContentUrls(finalTransaction, content);
            // Dispatch content data to Redux for caching
            dispatch(setContentData({ 
                id: finalTransaction.id, 
                content: { ...content, urls: finalContentUrls }
            }));
        }

        // --- Update Component State --- 
        if (mounted) {
            setTransaction(finalTransaction);
            setContentUrls(finalContentUrls);

            let fetchedOwnerPrincipal = ownerInfo?.principal || ''; // Get current owner principal if already fetched

            // Fetch owner only if needed and not already present
            if (showOwnerInfo && !ownerInfo) {
                 try {
                    const info = await getNftOwnerInfo(tokenId);
                    if (mounted) {
                       setOwnerInfo(info);
                       fetchedOwnerPrincipal = info?.principal || ''; // Update principal for balance fetch
                    }
                 } catch(err) {
                     console.error('Failed to load owner info:', err)
                 }
            }
            
            // Fetch balances if needed (Re-fetch here to ensure freshness after direct load)
            if (showBalances) { 
                console.log('[NftDisplay] Fetching balances for token:', tokenId);
                // Pass currentArweaveId and potentially fetched owner principal to ensure Redux update has full info
                fetchNftBalances(tokenId, tokenType, mounted, dispatch, currentArweaveId, fetchedOwnerPrincipal);
            }
        }

      } catch (error) {
        console.error('[NftDisplay] Failed to load NFT:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to load NFT data');
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
    // Dependency array: Use the normalized transactionDependency
  }, [tokenId, arweaveId, transactionDependency, loadingStrategy, dispatch, showOwnerInfo, showBalances, nfts, transactions, contentData, arweaveToNftId, ownerInfo]);

  // Helper function to fetch balances and update Redux
  async function fetchNftBalances(nftTokenId: string, tokenType: TokenType, mounted: boolean, dispatch: AppDispatch, fetchedArweaveId?: string, fetchedOwnerPrincipal?: string) {
      try {
          const nftIdBigInt = BigInt(nftTokenId);
          const subaccount = await nft_manager.to_nft_subaccount(nftIdBigInt);
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
              
              // Update Redux state, preserving existing data and adding balances
              const currentNftData = nfts[nftTokenId] || {}; // Get existing data or empty object
              dispatch(setNFTs({
                  [nftTokenId]: {
                      ...currentNftData, // Preserve existing fields
                      collection: currentNftData.collection || tokenType, // Use existing or fetched type
                      principal: fetchedOwnerPrincipal || currentNftData.principal || '', // Update principal if fetched
                      arweaveId: fetchedArweaveId || currentNftData.arweaveId || '', // Update Arweave ID if fetched
                      balances: { alex: alexTokens, lbry: lbryTokens } // Add/overwrite balances
                  }
              }));

              // Dispatch updateNftBalances as well if still needed elsewhere? 
              // setNFTs above should be sufficient for NftDisplay itself.
              // dispatch(updateNftBalances({...
          }
      } catch (error) {
          console.error('Failed to load NFT balances for token:', nftTokenId, error);
          // Optionally update state to show balance loading error
          // if (mounted) setError("Failed to load balances");
      }
  }

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