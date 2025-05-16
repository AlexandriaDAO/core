import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { Transaction } from '@/apps/Modules/shared/types/queries';
import { setContentData } from '@/apps/Modules/shared/state/transactions/transactionSlice';
import ContentRenderer from '@/apps/Modules/AppModules/safeRender/ContentRenderer';
import { createTokenAdapter, determineTokenType, TokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { getNftOwnerInfo } from '@/apps/Modules/shared/utils/nftOwner';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { useUsername } from '@/hooks/useUsername';
import { NftDisplayProps } from './types';
import { getTransactionService } from '@/apps/Modules/shared/services/transactionService';

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";
const MAX_FETCH_ATTEMPTS_PER_ARWEAVE_ID = 3;

/**
 * Universal NFT Display Component
 * 
 * A flexible component for displaying NFTs consistently across the application.
 * Supports different display densities, data loading strategies, and customizable features.
 * Footer functionality has been removed and details are expected to be shown via hover effects.
 */
export const NftDisplay: React.FC<NftDisplayProps & { showOwnerInfo?: boolean }> = ({
  tokenId,
  variant = 'compact',
  aspectRatio = 1, // Default to 1:1 ratio
  inShelf = false,
  inModal = false,
  loadingStrategy = 'direct',
  arweaveId: initialArweaveId,
  transaction: providedTransaction,
  onClick,
  onViewDetails,
  showOwnerInfo = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>(); // Use useStore to get the store instance

  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | undefined>(providedTransaction);
  const [contentUrls, setContentUrls] = useState<any>(null);
  const [ownerInfo, setOwnerInfo] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ownerPrincipal, setOwnerPrincipal] = useState<string | null>(null);
  const [failedTokens, setFailedTokens] = useState<Set<string>>(new Set()); // Track failed token IDs
  const [currentlyFetchingTokenIds, setCurrentlyFetchingTokenIds] = useState<Set<string>>(new Set());
  // Use useRef for fetchAttemptsForArweaveId to avoid stale closures
  const fetchAttemptsRef = useRef<Map<string, number>>(new Map());

  // Redux state
  const contentData = useSelector((state: RootState) => state.transactions.contentData);
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const transactionsFromRedux = useSelector((state: RootState) => state.transactions.transactions);
  const { user } = useSelector((state: RootState) => state.auth);

  // Use the useUsername hook
  const { username: ownerUsername, isLoading: isLoadingOwnerUsername } = useUsername(ownerPrincipal);

  // Normalize providedTransaction for dependency array
  const transactionDependency = providedTransaction ?? undefined;

  const loadNFTData = useCallback(async (mountedChecker: { isMounted: boolean }) => {
    if (!tokenId) {
      if (mountedChecker.isMounted) {
        setError('Token ID is missing');
        setIsLoading(false);
      }
      return;
    }

    if (failedTokens.has(tokenId)) {
      if (mountedChecker.isMounted) {
        setError(`Previously failed to load NFT: ${tokenId}. Data may not be available.`);
        setIsLoading(false);
      }
      return;
    }

    if (currentlyFetchingTokenIds.has(tokenId)) {
      // Already fetching this token ID in this component instance, wait for it to complete.
      // Set loading true if not already, so UI shows loading.
      if (mountedChecker.isMounted && !isLoading) setIsLoading(true);
      return;
    }

    if (mountedChecker.isMounted) {
      setIsLoading(true);
      setError(null);
      setCurrentlyFetchingTokenIds(prev => new Set(prev).add(tokenId));
    }

    try {
      // 1. Determine Arweave ID
      let currentArweaveId = initialArweaveId;
      if (!currentArweaveId) {
        const storedNft = nfts[tokenId];
        currentArweaveId = storedNft?.arweaveId || arweaveToNftId[tokenId];
      }
      if (!currentArweaveId && loadingStrategy !== 'skip-metadata-fetch' as string) {
        try {
          console.log(`[NftDisplay] Fetching Arweave ID from tokenAdapter for token: ${tokenId}`);
          const tokenType: TokenType = determineTokenType(tokenId);
          const tokenAdapter = createTokenAdapter(tokenType);
          const nftId = BigInt(tokenId);
          const nftMetaData = await tokenAdapter.tokenToNFTData(nftId, '');
          currentArweaveId = nftMetaData.arweaveId;
        } catch (metaErr) {
          console.error(`[NftDisplay] Failed to retrieve Arweave ID for NFT metadata (Token: ${tokenId}):`, metaErr);
          throw new Error('Failed to retrieve Arweave ID for NFT metadata'); // This will be caught below
        }
      }

      if (!currentArweaveId) {
        throw new Error('Arweave ID could not be determined for token: ' + tokenId);
      }

      // 2. Check for Transaction in Redux or props
      let finalTransaction: Transaction | undefined = providedTransaction;
      if (!finalTransaction) {
        finalTransaction = transactionsFromRedux.find(t => t.id === currentArweaveId);
      }

      // 3. Fetch Transaction via Service if not found
      if (!finalTransaction) {
        // If initialArweaveId was provided by a parent orchestrator (e.g., ShelfCard),
        // and the transaction is not yet available (neither in props nor Redux),
        // NftDisplay should NOT initiate its own fetch for this Arweave ID.
        // It should remain in a loading state and wait for the parent's
        // orchestrated fetch to complete and update Redux, which will trigger a re-render.
        if (initialArweaveId) {
          console.log(`[NftDisplay] Token: ${tokenId}, ArweaveID ${initialArweaveId} was provided, but transaction not yet in Redux/props. Waiting for external Redux update.`);
          if (mountedChecker.isMounted && !isLoading) {
            setIsLoading(true); // Ensure loading state is active
          }
          // The finally block of loadNFTData will handle cleaning up currentlyFetchingTokenIds.
          return; // Exit and wait for Redux update from parent orchestrator.
        }

        // Original logic: NftDisplay is responsible for fetching if initialArweaveId was NOT provided,
        // or if Arweave ID was resolved internally and transaction still not found.
        const attempts = fetchAttemptsRef.current.get(currentArweaveId!) || 0;
        if (attempts >= MAX_FETCH_ATTEMPTS_PER_ARWEAVE_ID) {
          console.warn(`[NftDisplay] Max fetch attempts (${MAX_FETCH_ATTEMPTS_PER_ARWEAVE_ID}) reached for ArweaveID: ${currentArweaveId}. Marking token as failed.`);
          throw new Error(`Max fetch attempts for ArweaveID ${currentArweaveId}`);
        }

        // Directly mutate the ref's current value
        fetchAttemptsRef.current.set(currentArweaveId!, attempts + 1);
        
        console.log(`[NftDisplay] Transaction for Arweave ID ${currentArweaveId} not in Redux/props. Attempt ${attempts + 1}. Requesting fetch via TransactionService for token: ${tokenId}`);
        
        const transactionService = getTransactionService(dispatch, store.getState);
        try {
          // Service updates Redux. We rely on re-render from Redux state change.
          await transactionService.fetchNftTransactions([currentArweaveId!]); // Added non-null assertion for currentArweaveId
          // After this, the useEffect dependency on `transactionsFromRedux` should trigger a re-run.
          // For now, we just set loading and wait.
          if (mountedChecker.isMounted) setIsLoading(true); 
          return; // Exit and wait for Redux update
        } catch (serviceError) {
          console.error(`[NftDisplay] TransactionService failed for Arweave ID ${currentArweaveId} (Token: ${tokenId}):`, serviceError);
          throw new Error(`Service failed for ${currentArweaveId}: ${serviceError instanceof Error ? serviceError.message : String(serviceError)}`);
        }
      }
      
      if (!finalTransaction) {
         console.warn(`[NftDisplay] Transaction ${currentArweaveId} still not found after potential service call for token ${tokenId}. Might be transient or actual missing data.`);
         if (mountedChecker.isMounted) setIsLoading(true); 
         return;
      }

      // 4. Check for Content URLs in Redux or props
      let finalContentUrls = finalTransaction ? contentData[finalTransaction.id]?.urls : null;

      // 5. Load Content URLs via ContentService if not found and transaction exists
      if (finalTransaction && !finalContentUrls) {
        console.log(`[NftDisplay] Loading content URLs from ContentService for transaction: ${finalTransaction.id} (Token: ${tokenId})`);
        const content = await ContentService.loadContent(finalTransaction);
        finalContentUrls = await ContentService.getContentUrls(finalTransaction, content);
        if (mountedChecker.isMounted) {
          dispatch(setContentData({ 
              id: finalTransaction.id, 
              content: { ...content, urls: finalContentUrls }
          }));
        }
      }
      
      if (mountedChecker.isMounted) {
        setTransaction(finalTransaction);
        setContentUrls(finalContentUrls);
        if (failedTokens.has(tokenId)) {
            setFailedTokens(prev => { const newSet = new Set(prev); newSet.delete(tokenId); return newSet; });
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NFT data';
      console.error(`[NftDisplay] loadNFTData error for token ${tokenId}:`, errorMessage, err); // Corrected template literal
      if (mountedChecker.isMounted) {
        setError(errorMessage);
        setFailedTokens(prev => new Set(prev).add(tokenId!)); 
      }
    } finally {
      if (mountedChecker.isMounted) {
        setIsLoading(false);
        setCurrentlyFetchingTokenIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(tokenId!);
          return newSet;
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ 
    tokenId, initialArweaveId, providedTransaction, //transactionDependency, // Using providedTransaction directly
    dispatch, 
    store.getState, // Changed from store (full object) to store.getState (stable function reference)
    nfts, arweaveToNftId, transactionsFromRedux, contentData, 
    failedTokens, // currentlyFetchingTokenIds, // This was causing issues, rely on isMounted and outer checks
    loadingStrategy, isLoading 
  ]);

  useEffect(() => {
    const mountedChecker = { isMounted: true };
    // Check if we are already fetching this specific tokenId in this component instance
    // This check was inside loadNFTData, but it's better here to prevent even calling loadNFTData
    // if another call for the same tokenId is in progress for this instance.
    if (!currentlyFetchingTokenIds.has(tokenId!)) {
        loadNFTData(mountedChecker);
    }
    return () => {
      mountedChecker.isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadNFTData, tokenId]); // Added tokenId here because currentlyFetchingTokenIds was removed from loadNFTData deps

  useEffect(() => {
    let mounted = true;
    if (showOwnerInfo && tokenId) {
      if (failedTokens.has(tokenId)) return;

      getNftOwnerInfo(tokenId)
        .then(info => {
          if (mounted && info) {
            setOwnerPrincipal(info.principal);
          }
        })
        .catch(fetchErr => {
          if (mounted) {
            console.warn(`[NftDisplay] Failed to get owner info for token ${tokenId}:`, fetchErr);
            setOwnerPrincipal(null);
          }
        });
    } else if (!tokenId && mounted) {
        setOwnerPrincipal(null);
    }
    return () => { mounted = false; };
  }, [tokenId, showOwnerInfo, failedTokens]);

  const handleRenderError = useCallback(() => {
    if (transaction) {
      ContentService.clearTransaction(transaction.id);
    }
    if (tokenId) {
       console.warn(`[NftDisplay] Content rendering failed for token ${tokenId}. Marking as failed.`);
       setFailedTokens(prev => new Set(prev).add(tokenId));
       setError("Content rendering failed for this NFT.");
       setIsLoading(false); 
    }
  }, [transaction, tokenId]);

  const handleClick = useCallback(() => {
    if (failedTokens.has(tokenId!)) return; 
    if (onClick) {
      onClick();
    } else if (onViewDetails) {
      if (tokenId) {
        onViewDetails(tokenId);
      } else {
        console.warn("[NftDisplay] handleClick called without a valid tokenId");
      }
    }
  }, [onClick, onViewDetails, tokenId, failedTokens]);

  // This is the section you added/modified, I will integrate the original logic here:
  const displayErrorFromFailedTokens = failedTokens.has(tokenId!) 
    ? `Previously failed to load NFT: ${tokenId}. Data may not be available.` 
    : null;
  
  // Combine error from props/state with error from failed tokens
  const finalDisplayError = displayErrorFromFailedTokens || error;

  // Original isLoading check first
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

  // Then check for errors
  if (finalDisplayError) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center text-xs">
        {finalDisplayError}
      </div>
    );
  }

  // Get content for rendering (similar to original)
  const currentContent = transaction ? contentData[transaction.id] : null;

  // If no error, not loading, but still no content or transaction for content, show a preparing message.
  // This can happen if transaction is present but ContentService is still fetching URLs.
  if (!transaction || !currentContent || !contentUrls) {
    // If arweaveId was provided and we are presumably waiting for parent, this state is more likely.
    const waitingMessage = initialArweaveId && !transaction 
        ? `Preparing NFT data for ${tokenId}... (Waiting for transaction)`
        : `Preparing NFT content for ${tokenId}...`;
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-xs text-center">
        {waitingMessage}
      </div>
    );
  }
  
  // Original renderContent function (inline or separate)
  const renderActualContent = () => {
    switch (variant) {
      case 'full':
        return (
          <div className="w-full">
            <ContentRenderer
              transaction={transaction!}
              content={currentContent!}
              contentUrls={contentUrls!}
              handleRenderError={handleRenderError}
              inModal={inModal}
            />
          </div>
        );
      case 'grid':
        return (
          <div className="w-full h-full flex items-center justify-center bg-muted/10">
            <ContentRenderer
              transaction={transaction!}
              content={currentContent!}
              contentUrls={contentUrls!}
              handleRenderError={handleRenderError}
              inModal={false}
            />
          </div>
        );
      case 'compact':
      default:
        return (
          <ContentRenderer
            transaction={transaction!}
            content={currentContent!}
            contentUrls={contentUrls!}
            handleRenderError={handleRenderError}
            inModal={false}
          />
        );
    }
  };

  // Main return structure you provided, now with renderActualContent
  return (
    <div 
      className={`flex flex-col ${variant === 'full' ? 'p-4' : ''}`}
      onClick={handleClick}
      style={{ cursor: (onClick || onViewDetails && !failedTokens.has(tokenId!)) ? 'pointer' : 'default' }}
    >
      <div 
        className={`relative overflow-hidden rounded-md border border-border ${variant === 'full' ? 'w-full max-w-3xl mx-auto' : ''}`}
        style={{ aspectRatio: aspectRatio.toString() }}
      >
        {renderActualContent()} 
      </div>

      {/* Owner Information Display (from original) */}
      {showOwnerInfo && ownerPrincipal && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Owned by: {isLoadingOwnerUsername ? 'Loading...' : ownerUsername || ownerPrincipal}
        </div>
      )}
    </div>
  );
};
