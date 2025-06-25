import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { toast } from "sonner";
import { Principal } from '@dfinity/principal';
import { ALEX } from '@/../../declarations/ALEX';
import { LBRY } from '@/../../declarations/LBRY';
import { nft_manager } from '@/../../declarations/nft_manager';
import { setNFTs } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { setContentData, clearTransactionContent, ContentDataItem } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { convertE8sToToken } from '@/apps/Modules/shared/utils/tokenUtils';
import { createTokenAdapter, determineTokenType, TokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { getActorUserAssetCanister } from "@/features/auth/utils/authUtils";
import { fetchAssetFromUserCanister } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import { _SERVICE as AssetCanisterService } from "@/../../declarations/asset_manager/asset_manager.did";
import { natToArweaveId } from '@/utils/id_convert';

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

export const useNftData = (tokenId: string | undefined) => {
  const dispatch = useDispatch<AppDispatch>();

  // --- Selectors ---
  const { canisters: allUserAssetCanistersMap, canisterLoading: authCanisterMapLoading } = useSelector((state: RootState) => state.auth);
  const arweaveTxData = useSelector((state: RootState) => {
    if (!tokenId) return null;
    // Arweave ID might be in nftDataSlice if pre-fetched by batch thunk, or derive it
    const nftInfo = state.nftData.nfts[tokenId];
    const anArweaveId = nftInfo?.arweaveId;
    return anArweaveId ? state.transactions.arweaveTxCache[anArweaveId] : null;
  });
  const nftStaticDataFromCache = useSelector((state: RootState) => tokenId ? state.nftData.nfts[tokenId] : null);
  const contentItem = useSelector((state: RootState) => arweaveTxData ? state.transactions.contentData[arweaveTxData.id] : null);
  
  // --- Local State ---
  const [isLoading, setIsLoading] = useState(true); 
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);
  const [isAssetLoading, setIsAssetLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ownerPrincipal, setOwnerPrincipal] = useState<Principal | null>(null);
  const [contentUrls, setContentUrls] = useState<any>(null); 

  const [showModal, setShowModal] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    principal: false,
    link: false,
    tokenId: false
  });

  // --- Derived values ---
  const tokenType: TokenType | null = useMemo(() => tokenId ? determineTokenType(tokenId) : null, [tokenId]);
  const arweaveIdFromNftCache: string | null = useMemo(() => nftStaticDataFromCache?.arweaveId || null, [nftStaticDataFromCache]);
  
  // The arweaveId we will primarily work with. It can come from nftDataSlice (if pre-filled by batch) or derived if needed.
  // This also handles SBT to OG ID conversion implicitly if nftDataSlice.arweaveId was populated correctly by batch thunk.
  const primaryArweaveId = arweaveTxData?.id || arweaveIdFromNftCache;

  // --- Effects ---
  useEffect(() => {
    let mounted = true;
    if (!tokenId || !tokenType) {
      if (mounted) {
        setIsLoading(false);
        setError(tokenId ? 'Token type could not be determined.' : 'Token ID is missing.');
      }
      return;
    }

    console.log(`[useNftData ${tokenId}] Effect triggered. PrimaryArweaveId: ${primaryArweaveId}, ArweaveTxData Available: ${!!arweaveTxData}, AuthCanisterMapLoading: ${authCanisterMapLoading}`);
    
    // Reset states on tokenId change or if essential derived values change
    if (mounted) {
        setIsLoading(true); 
        setError(null);
        setOwnerPrincipal(null); // Reset owner info on new token ID
        setContentUrls(null); // Reset content urls
    }

    // 1. Core Arweave Metadata Dependency
    // If arweaveTxData (the metadata from Arweave) is not yet available, we cannot proceed.
    // The batch thunk is responsible for fetching this.
    if (!arweaveTxData) {
      console.log(`[useNftData ${tokenId}] Waiting for Arweave metadata (arweaveTxData). Current primaryArweaveId: ${primaryArweaveId}`);
      // If primaryArweaveId is also missing, it implies the batch thunk hasn't even processed this tokenId yet to determine its Arweave ID.
      // We will keep isLoading true. The batch thunk should eventually populate nftDataSlice with arweaveId, which then populates arweaveTxCache.
      if (mounted && !primaryArweaveId) {
        // This is a state where we don't even know the arweave ID yet.
        // Should be handled by a higher-level component dispatching fetchNftMetadataBatch
        console.log(`[useNftData ${tokenId}] Arweave ID is not known yet. Batch fetch should provide it.`);
      }
      // If primaryArweaveId IS known, but arweaveTxData is missing, it means metadata is still loading via batch.
      // Keep isLoading true.
      return; // Wait for arweaveTxData to be populated in Redux by the batch thunk
    }

    // At this point, arweaveTxData (metadata) IS available.
    // Also, primaryArweaveId is guaranteed to be arweaveTxData.id

    // 2. Owner and Asset Canister Map Dependency
    // Wait if the global asset canister map is still loading, as it's crucial for IC asset checks.
    if (authCanisterMapLoading && (!allUserAssetCanistersMap || Object.keys(allUserAssetCanistersMap).length === 0)) {
      console.log(`[useNftData ${tokenId}] Waiting for global asset canister map.`);
      if (mounted && !isLoading) setIsLoading(true); // Ensure loading is true if we enter this wait state
      return;
    }

    async function loadNftDetails() {
      if (!mounted || !tokenId || !tokenType || !arweaveTxData || !primaryArweaveId) return;
      
      console.log(`[useNftData ${tokenId}] Proceeding to load details. ArweaveID: ${primaryArweaveId}, Type: ${tokenType}`);
      if(mounted) {
        setIsLoading(true); // Overall loading for this hook instance
        setIsOwnerLoading(true);
      }

      try {
        let currentOwnerPrincipal: Principal;
        // Fetch Owner if not already in nftStaticDataFromCache or if cached owner is different
        if (nftStaticDataFromCache?.principal && ownerPrincipal && nftStaticDataFromCache.principal === ownerPrincipal.toText()) {
          currentOwnerPrincipal = ownerPrincipal!;
          console.log(`[useNftData ${tokenId}] Using owner from state: ${currentOwnerPrincipal.toString()}`);
        } else {
          console.log(`[useNftData ${tokenId}] Fetching owner...`);
          const displayTokenIdBigInt = BigInt(tokenId);
          const tokenAdapter = createTokenAdapter(tokenType);
          let idForOwnerCall = displayTokenIdBigInt;
          // For SBTs, owner is of the Scion ID itself, not the OG ID.
          // The arweaveId and asset key derivation uses OG ID (handled by primaryArweaveId already if batch thunk did its job).
          
          const ownerResults = await tokenAdapter.getOwnerOf([idForOwnerCall]);
          if (ownerResults && ownerResults[0] && ownerResults[0][0]) {
            currentOwnerPrincipal = ownerResults[0][0].owner;
            if (mounted) setOwnerPrincipal(currentOwnerPrincipal);
            // Dispatch to update nftDataSlice with the owner
            dispatch(setNFTs({
              [tokenId]: {
                ...(nftStaticDataFromCache || {}), // Preserve existing data like arweaveId, collection, balances
                principal: currentOwnerPrincipal.toString(),
                collection: tokenType, // Ensure collection type is also set/updated
                arweaveId: primaryArweaveId || '' // Ensure arweaveId is also set/updated
              }
            }));
            console.log(`[useNftData ${tokenId}] Owner fetched: ${currentOwnerPrincipal.toString()}`);
          } else {
            console.error(`[useNftData ${tokenId}] NFT Owner not found.`);
            if (mounted) setError('NFT Owner not found');
            toast.error('NFT Owner not found');
            if (mounted) {
                setIsOwnerLoading(false); 
                setIsLoading(false); // Stop overall loading on critical error
            }
            return;
          }
        }
        if(mounted) setIsOwnerLoading(false);

        // --- Asset Blob Fetching (IC Canister then Arweave) ---
        // Check if content (blob) is already in transactionSlice.contentData for this Arweave ID
        if (contentItem && (contentItem.data || contentItem.urls)) {
          console.log(`[useNftData ${tokenId}] Content for ${primaryArweaveId} already in Redux. Source: ${contentItem.source}`);
          if (mounted) {
            setContentUrls(contentItem.urls || null); 
          }
        } else {
          if(mounted) setIsAssetLoading(true);
          console.log(`[useNftData ${tokenId}] Content for ${primaryArweaveId} not in Redux. Attempting to load...`);
          let loadedContent: any = null;
          let loadedUrls: any = undefined;
          let loadedFromIC = false;
          let contentSource = 'unknown';

          const ownerPrincipalStr = currentOwnerPrincipal.toString();
          if (allUserAssetCanistersMap && Object.keys(allUserAssetCanistersMap).length > 0) {
            const ownerAssetCanisterId = allUserAssetCanistersMap[ownerPrincipalStr];
            if (ownerAssetCanisterId) {
              try {
                console.log(`[useNftData ${tokenId}] Owner ${ownerPrincipalStr} has asset canister ${ownerAssetCanisterId}. Attempting to load ArweaveID ${primaryArweaveId} (key: /arweave/${primaryArweaveId}) from it.`);

                const baseUrl = process.env.DFX_NETWORK == "local" ? `http://${ownerAssetCanisterId}.localhost:4943` : `https://${ownerAssetCanisterId}.raw.icp0.io`;
                const assetUrl = `${baseUrl}/arweave/${primaryArweaveId}`;

                const response = await fetch(assetUrl);
                if(response.ok){
                  console.log(`[useNftData ${tokenId}] SUCCESS: Asset /arweave/${primaryArweaveId} found in owner's IC canister ${ownerAssetCanisterId}.`);
                  const contentType = response.headers.get('Content-Type');

                  loadedContent = {
                    id: primaryArweaveId,
                    contentType: contentType,
                    source: 'ic_canister',
                  };
                  loadedUrls = { fullUrl: assetUrl, display: assetUrl, thumbnail: assetUrl };
                  if (mounted) setContentUrls(loadedUrls);
                  loadedFromIC = true;
                  contentSource = 'ic_canister';
                }else{
                  console.log(`[useNftData ${tokenId}] Asset /arweave/${primaryArweaveId} NOT found in owner's IC canister ${ownerAssetCanisterId}.`);
                }
              } catch (icError) {
                console.warn(`[useNftData ${tokenId}] ERROR fetching asset with ArweaveID ${primaryArweaveId} from owner's IC canister ${ownerAssetCanisterId}:`, icError);
              }
            } else {
              console.log(`[useNftData ${tokenId}] Owner ${ownerPrincipalStr} not found in the global asset canister map.`);
            }
          } else {
            console.log(`[useNftData ${tokenId}] Global asset canister map is empty or not available.`);
          }

          if (!loadedFromIC) {
            console.log(`[useNftData ${tokenId}] FALLBACK: Asset ${primaryArweaveId} not loaded from IC, fetching from Arweave using ContentService.`);
            // arweaveTxData is the metadata (Transaction object)
            const arweaveContent = await ContentService.loadContent(arweaveTxData); // Relies on arweave.net/TX_ID by default
            const arweaveUrls = await ContentService.getContentUrls(arweaveTxData, arweaveContent);
            loadedContent = { ...arweaveContent, id: primaryArweaveId, source: 'arweave' };
            loadedUrls = arweaveUrls;
            if (mounted) setContentUrls(arweaveUrls);
            contentSource = 'arweave';
          }
          
          if (mounted && loadedContent) {
            console.log(`[useNftData ${tokenId}] Dispatching content for ${primaryArweaveId}, source: ${contentSource}`);
            dispatch(setContentData({
              id: primaryArweaveId, 
              content: { ...loadedContent, urls: loadedUrls }
            }));
          }
          if(mounted) setIsAssetLoading(false);
        }

        // --- Balances Fetching ---
        // Fetch balances if not already in nftStaticDataFromCache or if they are zero/undefined
        const needsBalanceFetch = !nftStaticDataFromCache?.balances || 
                                 (nftStaticDataFromCache.balances.alex === '0' && nftStaticDataFromCache.balances.lbry === '0');
        
        if (needsBalanceFetch) {
          if(mounted) setIsBalanceLoading(true);
          console.log(`[useNftData ${tokenId}] Fetching balances...`);
          const displayTokenIdBigInt = BigInt(tokenId);
          let idForSubaccountCall = displayTokenIdBigInt;
          if (tokenType === 'SBT') {
            // For SBTs, the subaccount is derived from the OG_ID to check the escrow account.
            try {
                const ogNftIdBigInt = await nft_manager.scion_to_og_id(displayTokenIdBigInt);
                idForSubaccountCall = ogNftIdBigInt;
            } catch (err) {
                console.error(`[useNftData ${tokenId}] Error converting SBT ${tokenId} to OG ID for balance check:`, err);
                // Proceed without correct SBT balance if conversion fails, or handle error more gracefully
            }
          }

          const subaccount = await nft_manager.to_nft_subaccount(idForSubaccountCall);
          const balanceParams = {
            owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
            subaccount: [Array.from(subaccount)] as [number[]]
          };
          const [alexBalance, lbryBalance] = await Promise.all([
            ALEX.icrc1_balance_of(balanceParams),
            LBRY.icrc1_balance_of(balanceParams)
          ]);
          const alexTokens = convertE8sToToken(alexBalance);
          const lbryTokens = convertE8sToToken(lbryBalance);
          
          if (mounted) {
            dispatch(setNFTs({
              [tokenId]: {
                ...(nftStaticDataFromCache || {}), // Preserve other data like principal, arweaveId, collection
                principal: currentOwnerPrincipal.toString(), // Ensure owner is also part of this update
                arweaveId: primaryArweaveId || '', // Ensure arweaveId is part of this update
                collection: tokenType, // Ensure collection is part of this update
                balances: { alex: alexTokens, lbry: lbryTokens }
              }
            }));
            console.log(`[useNftData ${tokenId}] Balances fetched and dispatched: ALEX ${alexTokens}, LBRY ${lbryTokens}`);
          }
          if(mounted) setIsBalanceLoading(false);
        } else {
          console.log(`[useNftData ${tokenId}] Balances already in cache or deemed not to need fetching.`);
          if(mounted) setIsBalanceLoading(false);
        }

        if (mounted) {
            setError(null); // Clear any previous error if all steps succeeded
        }

      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load NFT details';
        console.error(`[useNftData ${tokenId}] CRITICAL ERROR loading NFT details for token ID ${tokenId}, ArweaveID ${primaryArweaveId}:`, error);
        if (mounted) {
            setError(errorMessage);
            toast.error(errorMessage);
        }
      } finally {
        if (mounted) {
            setIsOwnerLoading(false);
            setIsAssetLoading(false);
            setIsBalanceLoading(false);
            setIsLoading(false); // Final loading state update
        }
      }
    }
    
    loadNftDetails();
    
    return () => {
      mounted = false;
      // Optionally, clear content data for this specific Arweave ID if the component unmounts
      // to free up memory if this content is not shown elsewhere. Consider implications.
      // if (primaryArweaveId) {
      //   dispatch(clearTransactionContent(primaryArweaveId));
      // }
    };
  // Key dependencies: tokenId, tokenType, arweaveTxData (from Redux), primaryArweaveId (derived), 
  // allUserAssetCanistersMap, authCanisterMapLoading (global states from Redux)
  // nftStaticDataFromCache, contentItem (to check if refetch is needed)
  }, [tokenId, tokenType, arweaveTxData, dispatch, allUserAssetCanistersMap, authCanisterMapLoading]);

  const handleRenderError = (transactionId?: string) => {
    if (arweaveTxData) {
        const idToClear = transactionId || arweaveTxData.id;
        console.warn(`[useNftData ${tokenId}] Render error encountered for ${idToClear}. Clearing from ContentService cache.`);
        ContentService.clearTransaction(idToClear); 
        // Also clear from Redux contentData to force a reload of asset blob (IC or Arweave) next time
        dispatch(clearTransactionContent(idToClear));
        // Re-trigger asset loading part by briefly setting contentUrls to null
        // This might need a more robust way to re-initiate only the asset fetching.
        setContentUrls(null);
        // Consider if we need to reset part of the loading state here to re-trigger asset loading
        // setIsAssetLoading(true); // This might re-trigger the effect or part of it.
    }
  };

  // isLoading is true if any of the sub-loading states are true, or the main one.
  const trulyLoading = isLoading || isOwnerLoading || isAssetLoading || isBalanceLoading;

  return {
    isLoading: trulyLoading,
    transaction: arweaveTxData, // This is the Arweave metadata
    contentUrls,
    ownerInfo: ownerPrincipal ? { principal: ownerPrincipal } : (nftStaticDataFromCache?.principal ? { principal: Principal.fromText(nftStaticDataFromCache.principal) } : null),
    nftData: nftStaticDataFromCache, // This contains owner, arweaveId, collection, balances from nftDataSlice
    content: contentItem as ContentDataItem | null, // This contains the blob/urls from transactionSlice.contentData
    error,
    showModal,
    setShowModal,
    copiedStates,
    setCopiedStates,
    handleRenderError
  };
}; 