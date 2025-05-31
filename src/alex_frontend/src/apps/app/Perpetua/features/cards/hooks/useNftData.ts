import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { toast } from "sonner";
import { Principal } from '@dfinity/principal';
import { ALEX } from '@/../../declarations/ALEX';
import { LBRY } from '@/../../declarations/LBRY';
import { nft_manager } from '@/../../declarations/nft_manager';
import { setNFTs } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { setContentData } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { fetchTransactionById } from '@/apps/Modules/LibModules/arweaveSearch/api/directArweaveClient';
import { convertE8sToToken } from '@/apps/Modules/shared/utils/tokenUtils';
import { createTokenAdapter, determineTokenType, TokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { getActorUserAssetCanister } from "@/features/auth/utils/authUtils";
import { fetchAssetFromUserCanister } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import { _SERVICE as AssetCanisterService } from "@/../../declarations/asset_manager/asset_manager.did";

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

export const useNftData = (tokenId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [contentUrls, setContentUrls] = useState<any>(null);
  const [ownerInfo, setOwnerInfo] = useState<{ principal: Principal } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    principal: false,
    link: false,
    tokenId: false
  });
  
  const dispatch = useDispatch<AppDispatch>();
  const contentData = useSelector((state: RootState) => state.transactions.contentData);
  const { nfts } = useSelector((state: RootState) => state.nftData);
  const nftData = tokenId ? nfts[tokenId] : null;
  const content = transaction ? contentData[transaction.id] : null;
  const { canisters: allUserAssetCanistersMap, canisterLoading } = useSelector((state: RootState) => state.auth); 

  useEffect(() => {
    let mounted = true;

    async function loadNFTData() {
      if (!tokenId) {
        if (mounted) setIsLoading(false);
        return;
      }
      console.log(`[useNftData] Attempting to load NFT: ${tokenId}`);

      if (canisterLoading && (!allUserAssetCanistersMap || Object.keys(allUserAssetCanistersMap).length === 0)) {
        console.log("[useNftData] Waiting: Global asset canister map is loading and not yet populated.");
        if (!isLoading && mounted) setIsLoading(true);
        return;
      }

      try {
        if (mounted && !isLoading) setIsLoading(true);
        
        const displayTokenIdBigInt = BigInt(tokenId);
        const tokenType: TokenType = determineTokenType(tokenId);
        const tokenAdapter = createTokenAdapter(tokenType);

        let idForOwnerCall = displayTokenIdBigInt;
        let idForArweaveAndAssetKeyDerivation = displayTokenIdBigInt;
        let idForSubaccountCall = displayTokenIdBigInt;
        let ownerPrincipal: Principal;

        if (tokenType === 'SBT') {
          const ogNftIdBigInt = await nft_manager.scion_to_og_id(displayTokenIdBigInt);
          idForSubaccountCall = ogNftIdBigInt;
        }
        
        const ownerResults = await tokenAdapter.getOwnerOf([idForOwnerCall]);
        if (ownerResults && ownerResults[0] && ownerResults[0][0]) {
          ownerPrincipal = ownerResults[0][0].owner;
          if (mounted) setOwnerInfo({ principal: ownerPrincipal });
        } else {
          console.error(`[useNftData] NFT Owner not found for token ID: ${tokenId}`);
          toast.error('NFT Owner not found');
          if (mounted) setIsLoading(false);
          return;
        }
        
        const nftStaticData = await tokenAdapter.tokenToNFTData(idForArweaveAndAssetKeyDerivation, ownerPrincipal.toString());
        const arweaveId = nftStaticData.arweaveId;
        console.log(`[useNftData] TokenID: ${tokenId}, Type: ${tokenType}, Owner: ${ownerPrincipal.toString()}, ArweaveID: ${arweaveId}`);
        
        const txData = await fetchTransactionById(arweaveId);
        if (!txData) {
          console.error(`[useNftData] Arweave transaction metadata not found for ArweaveID: ${arweaveId}`);
          toast.error('Transaction metadata not found');
          if (mounted) setIsLoading(false);
          return;
        }
        
        if (mounted) {
          setTransaction(txData);

          let loadedContent: any = null;
          let loadedUrls: any = undefined;
          let loadedFromIC = false;
          let contentSource = 'unknown'; // For logging

          const ownerPrincipalStr = ownerPrincipal.toString();
          if (allUserAssetCanistersMap && Object.keys(allUserAssetCanistersMap).length > 0) {
            const ownerAssetCanisterId = allUserAssetCanistersMap[ownerPrincipalStr];
            if (ownerAssetCanisterId) {
              try {
                console.log(`[useNftData] Owner ${ownerPrincipalStr} has asset canister ${ownerAssetCanisterId}. Attempting to load ArweaveID ${arweaveId} (key: /arweave/${arweaveId}) from it.`);
                const assetActor = await getActorUserAssetCanister(ownerAssetCanisterId) as unknown as AssetCanisterService;
                const assetKeyInCanister = `/arweave/${arweaveId}`; 
                
                const assetResult = await fetchAssetFromUserCanister(assetKeyInCanister, assetActor);
                if (assetResult?.blob) {
                  console.log(`[useNftData] SUCCESS: Asset ${assetKeyInCanister} found in owner's IC canister ${ownerAssetCanisterId}.`);
                  const assetUrl = URL.createObjectURL(assetResult.blob);
                  loadedContent = { 
                    id: txData.id, 
                    data: assetResult.blob,
                    contentType: assetResult.contentType,
                    source: 'ic_canister' 
                  };
                  loadedUrls = { primary: assetUrl, display: assetUrl, thumbnail: assetUrl }; 
                  setContentUrls(loadedUrls); 
                  loadedFromIC = true;
                  contentSource = 'ic_canister';
                } else {
                  console.log(`[useNftData] Asset ${assetKeyInCanister} NOT found in owner's IC canister ${ownerAssetCanisterId}.`);
                }
              } catch (icError) {
                console.warn(`[useNftData] ERROR fetching asset with ArweaveID ${arweaveId} (expected key: /arweave/${arweaveId}) from owner's IC canister ${ownerAssetCanisterId}:`, icError);
              }
            } else {
              console.log(`[useNftData] Owner ${ownerPrincipalStr} not found in the global asset canister map (no assigned canister).`);
            }
          } else {
            console.log("[useNftData] Global asset canister map is empty or not available. Skipping IC check for owner's canister.");
          }

          if (!loadedFromIC) {
            console.log(`[useNftData] FALLBACK: Asset ${arweaveId} not loaded from IC, fetching from Arweave.`);
            const arweaveContent = await ContentService.loadContent(txData);
            const arweaveUrls = await ContentService.getContentUrls(txData, arweaveContent);
            loadedContent = { ...arweaveContent, id: txData.id, source: 'arweave' };
            loadedUrls = arweaveUrls;
            setContentUrls(arweaveUrls);
            contentSource = 'arweave';
          }
          
          if (loadedContent) {
            console.log(`[useNftData] Dispatching content for ${txData.id}, source: ${contentSource}`);
            dispatch(setContentData({ 
              id: txData.id, 
              content: { ...loadedContent, urls: loadedUrls }
            }));
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
          dispatch(setNFTs({
            [tokenId]: {
              collection: tokenType,
              principal: ownerPrincipal.toString(),
              arweaveId: arweaveId,
              balances: { alex: alexTokens, lbry: lbryTokens }
            }
          }));
        }
      } catch (error) {
        console.error(`[useNftData] CRITICAL ERROR loading NFT data for token ID: ${tokenId}`, error);
        if (mounted) toast.error('Failed to load NFT data');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    
    loadNFTData();
    
    return () => {
      mounted = false;
    };
  }, [tokenId, dispatch, allUserAssetCanistersMap, canisterLoading, isLoading]);

  const handleRenderError = (transactionId?: string) => {
    if (transaction) {
      ContentService.clearTransaction(transactionId || transaction.id);
    }
  };

  return {
    isLoading,
    transaction,
    contentUrls,
    ownerInfo,
    nftData,
    content,
    showModal,
    setShowModal,
    copiedStates,
    setCopiedStates,
    handleRenderError
  };
}; 