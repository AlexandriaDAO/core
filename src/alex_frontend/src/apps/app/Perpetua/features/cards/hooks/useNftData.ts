import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { Principal } from '@dfinity/principal';
import { ALEX } from '@/../../declarations/ALEX';
import { LBRY } from '@/../../declarations/LBRY';
import { nft_manager } from '@/../../declarations/nft_manager';
import { setNFTs } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { clearTransactionContent, setContentData, ContentDataItem, setArweaveTxInCache } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { convertE8sToToken } from '@/apps/Modules/shared/utils/tokenUtils';
import { createTokenAdapter, determineTokenType, TokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { NFTData } from '@/apps/Modules/shared/types/nft';
import { natToArweaveId } from '@/utils/id_convert';
import { fetchTransactionsByIds } from '@/apps/Modules/LibModules/arweaveSearch/api/directArweaveClient';
import { Transaction as ArweaveTransaction } from '@/apps/Modules/shared/types/queries';
import { ContentUrlInfo, CachedContent } from '@/apps/Modules/LibModules/contentDisplay/types';

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

export const useNftData = (tokenId: string | undefined) => {
  const hookStartTime = performance.now();
  
  console.log(`[useNftData] HOOK CALLED with tokenId: ${tokenId}`);

  const dispatch = useDispatch<AppDispatch>();

  // --- Selectors ---
  const { canisters: allUserAssetCanistersMap, canisterLoading: authCanisterMapLoading } = useSelector((state: RootState) => state.auth);
  const nftStaticDataFromCache = useSelector((state: RootState) => tokenId ? state.nftData.nfts[tokenId] : null);
  const arweaveTxFromCache = useSelector((state: RootState) => {
    if (!tokenId) return null;
    const derivedArweaveId = nftStaticDataFromCache?.arweaveId;
    return derivedArweaveId ? state.transactions.arweaveTxCache[derivedArweaveId] : null;
  });
  const contentItemFromCache = useSelector((state: RootState) => {
    if (!tokenId) return null;
    const derivedArweaveId = nftStaticDataFromCache?.arweaveId;
    return derivedArweaveId ? state.transactions.contentData[derivedArweaveId] : null;
  });
  
  // --- Local State ---
  const [isNftDetailsLoading, setIsNftDetailsLoading] = useState(true);
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isAssetLoading, setIsAssetLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ownerPrincipal, setOwnerPrincipal] = useState<Principal | null>(null);
  const [derivedArweaveId, setDerivedArweaveId] = useState<string | null>(null);
  const [assetContentUrls, setAssetContentUrls] = useState<ContentUrlInfo | null>(null);
  const [assetSource, setAssetSource] = useState<'ic_canister' | 'arweave' | 'unknown' | null>(null);
  const [currentArweaveTx, setCurrentArweaveTx] = useState<ArweaveTransaction | null>(null);


  const [showModal, setShowModal] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    principal: false,
    link: false,
    tokenId: false
  });

  // --- Derived values ---
  const tokenType: TokenType | null = useMemo(() => {
    const type = tokenId ? determineTokenType(tokenId) : null;
    console.log(`[useNftData ${tokenId}] Token type determined: ${type}`);
    return type;
  }, [tokenId]);
  
  // Effect for deriving Arweave ID and then loading everything
  useEffect(() => {
    let mounted = true;
    console.log(`[useNftData ${tokenId}] useEffect triggered - tokenId: ${tokenId}, tokenType: ${tokenType}`);
    
    if (!tokenId || !tokenType) {
      console.log(`[useNftData ${tokenId}] Early exit - tokenId: ${!!tokenId}, tokenType: ${!!tokenType}`);
      if (mounted) {
        setIsNftDetailsLoading(false);
        setIsAssetLoading(false);
        setError(tokenId ? 'Token type could not be determined.' : 'Token ID is missing.');
      }
      return;
    }

    let localDerivedArweaveId = nftStaticDataFromCache?.arweaveId || null;

    const deriveAndLoad = async () => {
      if (!mounted) return;
      const overallAssetLoadStart = performance.now();
      console.log(`[BENCH] ASSET_LOAD_START: Token ${tokenId}`);
      
      setIsNftDetailsLoading(true);
      setIsAssetLoading(true);
      setError(null);
      setAssetSource(null);
      setAssetContentUrls(null);
      setCurrentArweaveTx(null);

      // 1. Derive Arweave ID if not already in cache
      if (!localDerivedArweaveId) {
        console.log(`[useNftData ${tokenId}] Deriving Arweave ID...`);
        try {
          const displayTokenIdBigInt = BigInt(tokenId);
          let idForArweaveDerivation = displayTokenIdBigInt;
          if (tokenType === 'SBT') {
            const ogNftIdBigInt = await nft_manager.scion_to_og_id(displayTokenIdBigInt);
            idForArweaveDerivation = ogNftIdBigInt;
          }
          localDerivedArweaveId = natToArweaveId(idForArweaveDerivation);
          if (mounted) setDerivedArweaveId(localDerivedArweaveId);
          
          const nftUpdatePayload: Partial<NFTData> = {
            ...nftStaticDataFromCache,
            arweaveId: localDerivedArweaveId,
            collection: tokenType,
          };
          dispatch(setNFTs({ [tokenId]: nftUpdatePayload as NFTData }));
          console.log(`[useNftData ${tokenId}] Arweave ID derived: ${localDerivedArweaveId}`);
        } catch (err) {
          console.error(`[useNftData ${tokenId}] Error deriving Arweave ID:`, err);
          if (mounted) {
            setError('Failed to derive Arweave ID.');
            setIsNftDetailsLoading(false);
            setIsAssetLoading(false);
          }
          console.log(`[BENCH] ASSET_LOAD_END: Token ${tokenId} (Arweave ID derivation failed) - ${(performance.now() - overallAssetLoadStart).toFixed(2)}ms`);
          return;
        }
      } else {
         if (mounted) setDerivedArweaveId(localDerivedArweaveId);
         console.log(`[useNftData ${tokenId}] Using Arweave ID from cache: ${localDerivedArweaveId}`);
      }

      if (!localDerivedArweaveId) {
        if (mounted) {
            setError('Arweave ID could not be established.');
            setIsNftDetailsLoading(false);
            setIsAssetLoading(false);
        }
        console.log(`[BENCH] ASSET_LOAD_END: Token ${tokenId} (Arweave ID not established) - ${(performance.now() - overallAssetLoadStart).toFixed(2)}ms`);
        return;
      }

      // 2. Load Owner
      let currentOwner: Principal | null = null;
      
      // First check if we have cached owner data
      if (nftStaticDataFromCache?.principal) {
        currentOwner = Principal.fromText(nftStaticDataFromCache.principal);
        console.log(`[useNftData ${tokenId}] Using owner from cache: ${currentOwner.toString()}`);
      } else if (ownerPrincipal) {
        currentOwner = ownerPrincipal;
        console.log(`[useNftData ${tokenId}] Using owner from state: ${currentOwner.toString()}`);
      }
      
      // Only fetch owner if we don't have it
      if (!currentOwner) {
        if (mounted) setIsOwnerLoading(true);
        try {
          console.log(`[useNftData ${tokenId}] Fetching owner...`);
          const displayTokenIdBigInt = BigInt(tokenId);
          const tokenAdapter = createTokenAdapter(tokenType);
          const ownerResults = await tokenAdapter.getOwnerOf([displayTokenIdBigInt]);
          if (ownerResults && ownerResults[0] && ownerResults[0][0]) {
            currentOwner = ownerResults[0][0].owner;
            if (mounted) setOwnerPrincipal(currentOwner);
            dispatch(setNFTs({ [tokenId]: { ...nftStaticDataFromCache, principal: currentOwner?.toString(), collection: tokenType, arweaveId: localDerivedArweaveId } as NFTData }));
            console.log(`[useNftData ${tokenId}] Owner fetched: ${currentOwner?.toString()}`);
          } else {
            throw new Error('NFT Owner not found');
          }
        } catch (err: any) {
          console.error(`[useNftData ${tokenId}] Error fetching owner:`, err);
          if (mounted) setError(err.message || 'Failed to fetch owner');
        } finally {
          if (mounted) setIsOwnerLoading(false);
        }
      }


      // 3. Attempt to load from ICP Asset Canister
      let assetLoadedFromICP = false;
      if (currentOwner && localDerivedArweaveId && allUserAssetCanistersMap) {
          const ownerText = currentOwner.toText();
          const userAssetCanisterIdString = allUserAssetCanistersMap[ownerText];
          console.log(`[useNftData ${tokenId}] Owner: ${ownerText}, Asset canisters available: ${Object.keys(allUserAssetCanistersMap).length}, Has canister: ${!!userAssetCanisterIdString}`);
          
          if (userAssetCanisterIdString) {
              console.log(`[useNftData ${tokenId}] User ${ownerText} has asset canister ${userAssetCanisterIdString}. Attempting ICP load for /arweave/${localDerivedArweaveId}`);
              const icpLoadAttemptStart = performance.now();
              
              // Helper function to attempt ICP fetch with timeout and retries
              const fetchWithRetry = async (url: string, maxRetries = 2, timeoutMs = 10000): Promise<Response> => {
                  for (let attempt = 1; attempt <= maxRetries; attempt++) {
                      console.log(`[useNftData ${tokenId}] ICP fetch attempt ${attempt}/${maxRetries}: ${url}`);
                      
                      let timeoutId: NodeJS.Timeout | undefined;
                      
                      try {
                          const controller = new AbortController();
                          timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                          
                          const response = await fetch(url, {
                              signal: controller.signal,
                              cache: 'no-cache', // Prevent aggressive caching that might cause inconsistencies
                              headers: {
                                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                                  'Pragma': 'no-cache'
                              }
                          });
                          
                          clearTimeout(timeoutId);
                          console.log(`[useNftData ${tokenId}] ICP fetch attempt ${attempt} response: ${response.status} ${response.statusText}`);
                          
                          if (response.ok) {
                              return response;
                          } else if (response.status === 404) {
                              // Don't retry 404s - asset doesn't exist
                              throw new Error(`Asset not found (404): ${url}`);
                          } else if (attempt === maxRetries) {
                              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                          }
                          // For other errors (5xx, network issues), continue to retry
                          console.warn(`[useNftData ${tokenId}] ICP fetch attempt ${attempt} failed with ${response.status}, retrying...`);
                          
                      } catch (error: any) {
                          if (timeoutId) {
                              clearTimeout(timeoutId);
                          }
                          if (error.name === 'AbortError') {
                              console.warn(`[useNftData ${tokenId}] ICP fetch attempt ${attempt} timed out after ${timeoutMs}ms`);
                          } else if (error.message.includes('404')) {
                              throw error; // Don't retry 404s
                          }
                          
                          if (attempt === maxRetries) {
                              throw error;
                          }
                          
                          console.warn(`[useNftData ${tokenId}] ICP fetch attempt ${attempt} error:`, error.message, '- retrying...');
                          // Brief delay before retry
                          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                      }
                  }
                  throw new Error('All retry attempts failed');
              };
              
              try {
                  // Use the same URL construction approach as useInit.ts
                  const isLocal = process.env.DFX_NETWORK == "local";
                  const baseUrl = isLocal ? `http://${userAssetCanisterIdString}.localhost:4943` : `https://${userAssetCanisterIdString}.raw.icp0.io`;
                  const canisterAssetUrl = `${baseUrl}/arweave/${localDerivedArweaveId}`;

                  console.log(`[useNftData ${tokenId}] Attempting to fetch: ${canisterAssetUrl}`);
                  const response = await fetchWithRetry(canisterAssetUrl);
                  
                  if (!mounted) {
                      console.log(`[useNftData ${tokenId}] Component unmounted during ICP fetch, aborting`);
                      return;
                  }
                  
                  const contentType = response.headers.get('Content-Type') ?? undefined;
                  const contentLength = response.headers.get('Content-Length');
                  console.log(`[useNftData ${tokenId}] ICP response headers - Content-Type: ${contentType}, Content-Length: ${contentLength}`);
                  
                  const blob = await response.blob();
                  console.log(`[useNftData ${tokenId}] ICP blob created - size: ${blob.size} bytes, type: ${blob.type}`);
                  
                  if (blob.size === 0) {
                      throw new Error('Received empty blob from ICP canister');
                  }
                  
                  const objectUrl = URL.createObjectURL(blob);
                  console.log(`[useNftData ${tokenId}] ICP object URL created: ${objectUrl}`);
                  
                  const icpUrls: ContentUrlInfo = {
                      thumbnailUrl: null,
                      coverUrl: null,
                      fullUrl: objectUrl,
                  };
                  setAssetContentUrls(icpUrls);
                  setAssetSource('ic_canister');
                  
                  // Create a minimal transaction object for ICP-loaded content
                  const icpTransaction: ArweaveTransaction = {
                      id: localDerivedArweaveId,
                      owner: currentOwner.toText(),
                      tags: []
                  };
                  setCurrentArweaveTx(icpTransaction);
                  
                  // For text content, extract the text
                  let textContent = null;
                  if (contentType?.includes('text/') || contentType?.includes('application/json')) {
                      textContent = await blob.text();
                      console.log(`[useNftData ${tokenId}] ICP text content extracted - length: ${textContent?.length || 0} chars`);
                  }
                  
                  const contentDataItem: ContentDataItem = {
                      url: canisterAssetUrl,
                      textContent: textContent,
                      imageObjectUrl: objectUrl,
                      thumbnailUrl: null,
                      error: null,
                      data: blob,
                      source: 'ic_canister',
                      contentType: contentType,
                      urls: icpUrls
                  };
                  dispatch(setContentData({ id: localDerivedArweaveId, content: contentDataItem }));
                  console.log(`[useNftData ${tokenId}] SUCCESS: Asset ${localDerivedArweaveId} loaded from ICP canister ${userAssetCanisterIdString} (${contentType}, ${blob.size} bytes).`);
                  assetLoadedFromICP = true;
                  
                  if (mounted) {
                      setIsAssetLoading(false);
                      setIsNftDetailsLoading(false);
                      setError(null);
                  }
                  
              } catch (icpError: any) {
                  console.error(`[useNftData ${tokenId}] FAILED: Error fetching asset ${localDerivedArweaveId} from ICP canister ${userAssetCanisterIdString}:`, {
                      error: icpError.message,
                      stack: icpError.stack,
                      name: icpError.name
                  });
                  // Don't set error state here - let it fall back to Arweave
              }
              console.log(`[BENCH] ICP_LOAD_ATTEMPT: ${localDerivedArweaveId} for token ${tokenId} - ${assetLoadedFromICP ? 'success' : 'failed_or_not_found'} - ${(performance.now() - icpLoadAttemptStart).toFixed(2)}ms`);
          } else {
              console.log(`[useNftData ${tokenId}] No asset canister found for owner ${ownerText}. Skipping ICP asset check.`);
          }
      }


      // 4. Fallback to Arweave if not loaded from ICP
      if (!assetLoadedFromICP && localDerivedArweaveId && mounted) {
        console.log(`[useNftData ${tokenId}] Proceeding to Arweave fallback for ${localDerivedArweaveId}.`);
        const arweaveFallbackStart = performance.now();
        if (mounted) setAssetSource('arweave');
        
        // Get fresh data from Redux store inside the effect
        const currentArweaveTxFromCache = arweaveTxFromCache;
        let txToProcess = currentArweaveTxFromCache;

        if (!txToProcess) {
            console.log(`[useNftData ${tokenId}] Arweave metadata for ${localDerivedArweaveId} not in Redux cache. Fetching...`);
            const arweaveMetadataFetchStart = performance.now();
            try {
                const fetchedTransactionsArray = await fetchTransactionsByIds([localDerivedArweaveId]);
                if (fetchedTransactionsArray && fetchedTransactionsArray.length > 0 && fetchedTransactionsArray[0]) {
                    txToProcess = fetchedTransactionsArray[0];
                    if (mounted) setCurrentArweaveTx(txToProcess);
                    dispatch(setArweaveTxInCache({ id: localDerivedArweaveId, transaction: txToProcess }));
                    console.log(`[useNftData ${tokenId}] Arweave metadata for ${localDerivedArweaveId} fetched and cached.`);
                    console.log(`[BENCH] ARWEAVE_METADATA_FETCH: ${localDerivedArweaveId} - success - ${(performance.now() - arweaveMetadataFetchStart).toFixed(2)}ms`);
                } else {
                    console.log(`[BENCH] ARWEAVE_METADATA_FETCH: ${localDerivedArweaveId} - not_found - ${(performance.now() - arweaveMetadataFetchStart).toFixed(2)}ms`);
                    throw new Error(`Arweave transaction ${localDerivedArweaveId} not found.`);
                }
            } catch (arweaveError: any) {
                console.error(`[useNftData ${tokenId}] Error fetching Arweave metadata for ${localDerivedArweaveId}:`, arweaveError);
                console.log(`[BENCH] ARWEAVE_METADATA_FETCH: ${localDerivedArweaveId} - error - ${(performance.now() - arweaveMetadataFetchStart).toFixed(2)}ms`);
                if (mounted) {
                    setError(arweaveError.message || `Failed to fetch Arweave metadata for ${localDerivedArweaveId}.`);
                    setIsAssetLoading(false);
                    setIsNftDetailsLoading(false); 
                }
            }
        } else {
            if (mounted) setCurrentArweaveTx(txToProcess);
            console.log(`[useNftData ${tokenId}] Using Arweave metadata for ${localDerivedArweaveId} from Redux cache.`);
        }
        
        if (txToProcess && mounted) {
            // Get fresh content data from Redux store inside the effect
            const currentContentItemFromCache = contentItemFromCache;
            const existingContent = currentContentItemFromCache;
            if (existingContent && existingContent.source === 'arweave' && existingContent.urls) {
                 console.log(`[useNftData ${tokenId}] Arweave content for ${localDerivedArweaveId} already in Redux contentData cache (likely from previous direct load).`);
                 setAssetContentUrls(existingContent.urls);
                 if (mounted) {
                     setIsAssetLoading(false);
                     setIsNftDetailsLoading(false);
                 }
            } else {
                console.log(`[useNftData ${tokenId}] Loading Arweave content for ${localDerivedArweaveId} (direct)...`);
                const arweaveContentLoadStart = performance.now();
                try {
                    const contentMetadata = await ContentService.loadContent(txToProcess); 
                    const urls = await ContentService.getContentUrls(txToProcess, contentMetadata);
                    if (mounted) {
                        setAssetContentUrls(urls);
                        const contentDataItem: ContentDataItem = {
                            ...contentMetadata,
                            source: 'arweave',
                            urls: urls
                        };
                        dispatch(setContentData({ id: localDerivedArweaveId, content: contentDataItem }));
                        console.log(`[useNftData ${tokenId}] Arweave content for ${localDerivedArweaveId} prepared for direct display.`);
                        setError(null);
                        setIsNftDetailsLoading(false);
                    }
                    console.log(`[BENCH] ARWEAVE_CONTENT_PREPARATION: ${localDerivedArweaveId} - success - ${(performance.now() - arweaveContentLoadStart).toFixed(2)}ms`);
                } catch (contentError: any) {
                    console.error(`[useNftData ${tokenId}] Error preparing Arweave content for ${localDerivedArweaveId}:`, contentError);
                    console.log(`[BENCH] ARWEAVE_CONTENT_PREPARATION: ${localDerivedArweaveId} - error - ${(performance.now() - arweaveContentLoadStart).toFixed(2)}ms`);
                    if (mounted) {
                        setError(contentError.message || `Failed to prepare Arweave content for ${localDerivedArweaveId}.`);
                        handleRenderError(localDerivedArweaveId); 
                    }
                } finally {
                    if (mounted) {
                        setIsAssetLoading(false);
                        setIsNftDetailsLoading(false);
                    }
                }
            }
        } else if (!txToProcess && mounted) {
             setIsAssetLoading(false);
             setIsNftDetailsLoading(false);
        }
        console.log(`[BENCH] ARWEAVE_FALLBACK_PROCESSING: Token ${tokenId} - ${(performance.now() - arweaveFallbackStart).toFixed(2)}ms`);
      } else if (assetLoadedFromICP && mounted) {
        setIsAssetLoading(false);
        setIsNftDetailsLoading(false);
      }


      // 5. Load Balances
      const needsBalanceFetch = currentOwner && (!nftStaticDataFromCache?.balances || (nftStaticDataFromCache.balances.alex === '0' && nftStaticDataFromCache.balances.lbry === '0'));
      if (needsBalanceFetch && currentOwner && localDerivedArweaveId) {
        if (mounted) setIsBalanceLoading(true);
        console.log(`[useNftData ${tokenId}] Fetching balances...`);
        const balanceFetchStart = performance.now();
        try {
          const displayTokenIdBigInt = BigInt(tokenId);
          let idForSubaccountCall = displayTokenIdBigInt;
          if (tokenType === 'SBT') { 
            const ogNftIdBigInt = await nft_manager.scion_to_og_id(displayTokenIdBigInt);
            idForSubaccountCall = ogNftIdBigInt;
          }

          const subaccount = await nft_manager.to_nft_subaccount(idForSubaccountCall);
          const balanceParams = { owner: Principal.fromText(NFT_MANAGER_PRINCIPAL), subaccount: [Array.from(subaccount)] as [number[]] };
          const [alexBalance, lbryBalance] = await Promise.all([
            ALEX.icrc1_balance_of(balanceParams),
            LBRY.icrc1_balance_of(balanceParams)
          ]);
          const alexTokens = convertE8sToToken(alexBalance);
          const lbryTokens = convertE8sToToken(lbryBalance);
          
          if (mounted) {
            const dispatchSetNFTsBalancesStart = performance.now();
            dispatch(setNFTs({ [tokenId]: { 
                ...nftStaticDataFromCache, 
                principal: currentOwner.toString(), 
                collection: tokenType, 
                arweaveId: localDerivedArweaveId, 
                balances: { alex: alexTokens, lbry: lbryTokens } 
            } as NFTData }));
            console.log(`[useNftData ${tokenId}] Balances fetched: ALEX ${alexTokens}, LBRY ${lbryTokens}`);
          }
        } catch (balanceError: any) {
          console.error(`[useNftData ${tokenId}] Error fetching balances:`, balanceError);
          if (mounted) setError(prev => prev ? `${prev}; Failed to fetch balances` : 'Failed to fetch balances');
        } finally {
          if (mounted) setIsBalanceLoading(false);
          console.log(`[BENCH] BALANCE_FETCH: Token ${tokenId} - ${(performance.now() - balanceFetchStart).toFixed(2)}ms`);
        }
      } else if (currentOwner) {
        console.log(`[useNftData ${tokenId}] Balances already in cache or not needed.`);
        if (mounted) setIsBalanceLoading(false);
      }

      if (mounted) {
        setIsNftDetailsLoading(false); 
      }
      console.log(`[BENCH] ASSET_LOAD_END: Token ${tokenId} - ${(performance.now() - overallAssetLoadStart).toFixed(2)}ms`);
    };

    deriveAndLoad();
    
    return () => {
      mounted = false;
      // Clean up any object URLs to prevent memory leaks
      if (assetContentUrls?.fullUrl && assetContentUrls.fullUrl.startsWith('blob:')) {
        URL.revokeObjectURL(assetContentUrls.fullUrl);
      }
      const hookEndTime = performance.now();
      console.log(`[BENCH] useNftData_TOTAL_DURATION: ${tokenId || 'undefined'} - ${(hookEndTime - hookStartTime).toFixed(2)}ms`);
    };

  }, [tokenId, tokenType]);


  const handleRenderError = (transactionId?: string) => {
    const idToClear = transactionId || derivedArweaveId;
    if (idToClear) {
        console.warn(`[useNftData ${tokenId}] Render error encountered for ${idToClear}. Clearing from Redux.`);
        dispatch(clearTransactionContent(idToClear));
        setError("Asset rendering error. Cleared data. Please try refreshing or check console.");
        setIsAssetLoading(false);
        setAssetContentUrls(null);
    }
  };
  
  const finalContentItem = contentItemFromCache || (derivedArweaveId ? { id: derivedArweaveId, urls: assetContentUrls, source: assetSource } : null);

  // Simplified loading state logic - just check if any loading state is true
  const trulyLoading = isNftDetailsLoading || isAssetLoading || isOwnerLoading || isBalanceLoading;

  return {
    isLoading: trulyLoading,
    transaction: currentArweaveTx || arweaveTxFromCache, 
    contentUrls: assetContentUrls,
    ownerInfo: ownerPrincipal ? { principal: ownerPrincipal } : (nftStaticDataFromCache?.principal ? { principal: Principal.fromText(nftStaticDataFromCache.principal) } : null),
    nftData: nftStaticDataFromCache ? {...nftStaticDataFromCache, arweaveId: derivedArweaveId || nftStaticDataFromCache.arweaveId } : null, 
    content: finalContentItem as ContentDataItem | null, 
    error,
    showModal,
    setShowModal,
    copiedStates,
    setCopiedStates,
    handleRenderError,
    assetSource
  };
}; 