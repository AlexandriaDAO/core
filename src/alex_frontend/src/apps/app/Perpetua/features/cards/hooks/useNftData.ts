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
import { getNftOwnerInfo } from '@/apps/Modules/shared/utils/nftOwner';
import { convertE8sToToken } from '@/apps/Modules/shared/utils/tokenUtils';
import { createTokenAdapter, determineTokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { Transaction } from "@/apps/Modules/shared/types/queries";

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

export const useNftData = (tokenId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [contentUrls, setContentUrls] = useState<any>(null);
  const [ownerInfo, setOwnerInfo] = useState<any | null>(null);
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

  // Load NFT data on component mount
  useEffect(() => {
    let mounted = true;

    async function loadNFTData() {
      if (!tokenId) return;

      try {
        setIsLoading(true);
        
        const tokenType = determineTokenType(tokenId);
        const tokenAdapter = createTokenAdapter(tokenType);
        const nftId = BigInt(tokenId);
        
        // Handle SBT type
        if (tokenType === 'SBT') {
          await nft_manager.scion_to_og_id(nftId);
        }
        
        // Get Arweave ID for this token
        const arweaveId = await tokenAdapter.tokenToNFTData(nftId, '').then(data => data.arweaveId);
        
        // Fetch transaction data from Arweave
        const txData = await fetchTransactionById(arweaveId);
        
        if (!txData) {
          console.error('Transaction not found for arweaveId:', arweaveId);
          toast.error('Transaction not found');
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
          
          // Get NFT owner info
          const ownerInfo = await getNftOwnerInfo(tokenId);
          setOwnerInfo(ownerInfo);
        

          // Get balances for this NFT
          const subaccount = await nft_manager.to_nft_subaccount(nftId);
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

          // Update NFT data in Redux store
          dispatch(setNFTs({
            [tokenId]: {
              collection: tokenType,
              principal: ownerInfo?.principal || '',
              arweaveId: arweaveId,
              balances: { alex: alexTokens, lbry: lbryTokens }
            }
          }));
        }
      } catch (error) {
        console.error('Failed to load NFT:', error);
        if (mounted) {
          toast.error('Failed to load NFT data');
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
  }, [tokenId, dispatch]);

  // Error handler for ContentRenderer
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