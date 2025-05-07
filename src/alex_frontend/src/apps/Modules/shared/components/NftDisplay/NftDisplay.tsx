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
import { setNFTs } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import ContentRenderer from '@/apps/Modules/AppModules/safeRender/ContentRenderer';
import { createTokenAdapter, determineTokenType, TokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { convertE8sToToken } from '@/apps/Modules/shared/utils/tokenUtils';
import { getNftOwnerInfo } from '@/apps/Modules/shared/utils/nftOwner';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { fetchTransactionById } from '@/apps/Modules/LibModules/arweaveSearch/api/directArweaveClient';
import { useUsername } from '@/hooks/useUsername';
import { NftDisplayProps } from './types';

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

/**
 * Universal NFT Display Component
 * 
 * A flexible component for displaying NFTs consistently across the application.
 * Supports different display densities, data loading strategies, and customizable features.
 * Footer functionality has been removed and details are expected to be shown via hover effects.
 */
const NftDisplay: React.FC<NftDisplayProps & { showOwnerInfo?: boolean }> = ({
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
  showOwnerInfo = false,
}) => {
  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [contentUrls, setContentUrls] = useState<any>(null);
  const [ownerInfo, setOwnerInfo] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ownerPrincipal, setOwnerPrincipal] = useState<string | null>(null);

  // Redux state
  const dispatch = useDispatch<AppDispatch>();
  const contentData = useSelector((state: RootState) => state.transactions.contentData);
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const { user } = useSelector((state: RootState) => state.auth);

  // Use the useUsername hook
  const { username: ownerUsername, isLoading: isLoadingOwnerUsername } = useUsername(ownerPrincipal);

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
  }, [tokenId, arweaveId, transactionDependency, loadingStrategy, dispatch, nfts, transactions, contentData, arweaveToNftId]);

  // Effect to fetch owner principal if showOwnerInfo is true and tokenId is present
  useEffect(() => {
    let mounted = true;
    if (showOwnerInfo && tokenId) {
      getNftOwnerInfo(tokenId)
        .then(info => {
          if (mounted && info) {
            setOwnerPrincipal(info.principal);
          }
        })
        .catch(err => {
          if (mounted) {
            console.error('[NftDisplay] Failed to get owner info:', err);
            setOwnerPrincipal(null); // Reset on error
          }
        });
    }
    return () => { mounted = false; };
  }, [tokenId, showOwnerInfo]);

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
      <div className={`flex flex-col items-center justify-center ${variant === 'full' ? 'h-96' : 'h-full'} text-muted-foreground p-4`}>
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
        className={`relative overflow-hidden rounded-md border border-border ${variant === 'full' ? 'w-full max-w-3xl mx-auto' : ''}`}
        style={{ aspectRatio: aspectRatio.toString() }}
      >
        {renderContent()}
      </div>

      {/* Owner Information Display */}
      {showOwnerInfo && ownerPrincipal && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Owned by: {isLoadingOwnerUsername ? 'Loading...' : ownerUsername || ownerPrincipal}
        </div>
      )}
    </div>
  );
};

export default NftDisplay; 