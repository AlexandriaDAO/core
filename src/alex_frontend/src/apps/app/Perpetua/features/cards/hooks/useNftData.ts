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
import { fetchAssetFromUserCanister } from '@/apps/Modules/shared/state/assetManager/assetManagerThunks';
import { fetchTransactionsByIds } from '@/apps/Modules/LibModules/arweaveSearch/api/directArweaveClient';
import { Transaction as ArweaveTransaction } from '@/apps/Modules/shared/types/queries';
import { ContentUrlInfo, CachedContent } from '@/apps/Modules/LibModules/contentDisplay/types';

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

export const useNftData = (tokenId: string | undefined) => {
  const hookStartTime = performance.now();

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
  const tokenType: TokenType | null = useMemo(() => tokenId ? determineTokenType(tokenId) : null, [tokenId]);
  
  let mounted = true;

  useEffect(() => {
    mounted = true;
    return () => {
      mounted = false;
      const hookEndTime = performance.now();
      console.log(`[BENCH] useNftData_TOTAL_DURATION: ${tokenId || 'undefined'} - ${(hookEndTime - hookStartTime).toFixed(2)}ms`);
    };
  }, [tokenId, hookStartTime]);


  // Effect for deriving Arweave ID and then loading everything
  useEffect(() => {
    if (!tokenId || !tokenType) {
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
      let currentOwner: Principal | null = ownerPrincipal;
      if (!currentOwner || (nftStaticDataFromCache?.principal && nftStaticDataFromCache.principal !== currentOwner.toText())) {
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
      }  else if (currentOwner) {
         console.log(`[useNftData ${tokenId}] Using owner from state: ${currentOwner.toString()}`);
      }


      // 3. Attempt to load from ICP Asset Canister
      let assetLoadedFromICP = false;
      if (currentOwner && localDerivedArweaveId && !authCanisterMapLoading) {
          const ownerText = currentOwner.toText();
          const userAssetCanisterIdString = allUserAssetCanistersMap?.[ownerText];
          
          if (userAssetCanisterIdString) {
              console.log(`[useNftData ${tokenId}] User ${ownerText} has asset canister ${userAssetCanisterIdString}. Attempting ICP load for /arweave/${localDerivedArweaveId}`);
              const icpLoadAttemptStart = performance.now();
              try {
                  const result = await fetchAssetFromUserCanister(localDerivedArweaveId, userAssetCanisterIdString);

                  if (result?.blob && mounted) {
                      const objectURL = URL.createObjectURL(result.blob);
                      const icpUrls: ContentUrlInfo = {
                          thumbnailUrl: null,
                          coverUrl: null,
                          fullUrl: objectURL,
                      };
                      setAssetContentUrls(icpUrls);
                      setAssetSource('ic_canister');
                      const contentDataItem: ContentDataItem = {
                          url: objectURL,
                          textContent: null,
                          imageObjectUrl: objectURL,
                          thumbnailUrl: null,
                          error: null,
                          data: result.blob,
                          source: 'ic_canister',
                          contentType: result.blob.type,
                          urls: icpUrls
                      };
                      dispatch(setContentData({ id: localDerivedArweaveId, content: contentDataItem }));
                      console.log(`[useNftData ${tokenId}] SUCCESS: Asset ${localDerivedArweaveId} loaded from ICP canister ${userAssetCanisterIdString}.`);
                      assetLoadedFromICP = true;
                      if (mounted) setIsAssetLoading(false);
                      if (mounted) setError(null);
                  } else if (mounted) {
                      console.log(`[useNftData ${tokenId}] Asset ${localDerivedArweaveId} NOT found in ICP canister ${userAssetCanisterIdString}.`);
                  }
              } catch (icpError) {
                  console.warn(`[useNftData ${tokenId}] Error fetching asset ${localDerivedArweaveId} from ICP canister ${userAssetCanisterIdString}:`, icpError);
              }
              console.log(`[BENCH] ICP_LOAD_ATTEMPT: ${localDerivedArweaveId} for token ${tokenId} - ${assetLoadedFromICP ? 'success' : 'failed_or_not_found'} - ${(performance.now() - icpLoadAttemptStart).toFixed(2)}ms`);
          } else {
              console.log(`[useNftData ${tokenId}] No asset canister found for owner ${ownerText}. Skipping ICP asset check.`);
          }
      } else if (authCanisterMapLoading) {
          console.log(`[useNftData ${tokenId}] Waiting for authCanisterMap to check ICP.`);
      }


      // 4. Fallback to Arweave if not loaded from ICP
      if (!assetLoadedFromICP && localDerivedArweaveId && mounted) {
        console.log(`[useNftData ${tokenId}] Proceeding to Arweave fallback for ${localDerivedArweaveId}.`);
        const arweaveFallbackStart = performance.now();
        if (mounted) setAssetSource('arweave');
        let txToProcess = arweaveTxFromCache;

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
            const existingContent = contentItemFromCache;
            if (existingContent && existingContent.source === 'arweave' && existingContent.urls) {
                 console.log(`[useNftData ${tokenId}] Arweave content for ${localDerivedArweaveId} already in Redux contentData cache (likely from previous direct load).`);
                 setAssetContentUrls(existingContent.urls);
                 if (mounted) setIsAssetLoading(false);
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
                        if (mounted) setError(null);
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
                    if (mounted) setIsAssetLoading(false);
                }
            }
        } else if (!txToProcess && mounted) {
             setIsAssetLoading(false); 
        }
        console.log(`[BENCH] ARWEAVE_FALLBACK_PROCESSING: Token ${tokenId} - ${(performance.now() - arweaveFallbackStart).toFixed(2)}ms`);
      } else if (assetLoadedFromICP && mounted) {
        setIsAssetLoading(false);
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
    }

  }, [
    tokenId, 
    tokenType, 
    dispatch, 
    allUserAssetCanistersMap, 
    authCanisterMapLoading,    
    nftStaticDataFromCache?.arweaveId, 
    nftStaticDataFromCache?.principal, 
    nftStaticDataFromCache?.balances,  
    ownerPrincipal, 
    contentItemFromCache,
    arweaveTxFromCache
  ]);


  const handleRenderError = (transactionId?: string) => {
    const idToClear = transactionId || derivedArweaveId;
    if (idToClear) {
        console.warn(`[useNftData ${tokenId}] Render error encountered for ${idToClear}. Clearing from Redux.`);
        dispatch(clearTransactionContent(idToClear));
        if(mounted) {
            setError("Asset rendering error. Cleared data. Please try refreshing or check console.");
            setIsAssetLoading(false);
            setAssetContentUrls(null);
        }
    }
  };
  
  const finalContentItem = contentItemFromCache || (derivedArweaveId ? { id: derivedArweaveId, urls: assetContentUrls, source: assetSource } : null);

  const trulyLoading = isNftDetailsLoading || isAssetLoading || isOwnerLoading || isBalanceLoading || 
    (authCanisterMapLoading && 
      (!ownerPrincipal || 
        (allUserAssetCanistersMap && !allUserAssetCanistersMap.hasOwnProperty(ownerPrincipal.toText())) || !allUserAssetCanistersMap
      )
    );

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