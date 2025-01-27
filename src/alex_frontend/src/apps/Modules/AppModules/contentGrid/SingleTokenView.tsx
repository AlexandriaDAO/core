import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ContentRenderer from '../safeRender/ContentRenderer';
import { ContentCard } from './Card';
import Modal from './components/Modal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { toast } from "sonner";
import { mint_nft } from "@/features/nft/mint";
import { withdraw_nft } from "@/features/nft/withdraw";
import { Principal } from '@dfinity/principal';
import { ALEX } from '../../../../../../declarations/ALEX';
import { LBRY } from '../../../../../../declarations/LBRY';
import { nft_manager } from '../../../../../../declarations/nft_manager';
import { updateNftBalances } from '../../shared/state/nftData/nftDataSlice';
import { arweaveIdToNat, natToArweaveId } from '@/utils/id_convert';
import { fetchTransactionById } from '../../LibModules/arweaveSearch/api/directArweaveClient';
import { ContentService } from '../../LibModules/contentDisplay/services/contentService';
import { setContentData } from '../../shared/state/content/contentDisplaySlice';
import { Transaction } from '../../shared/types/queries';
import { Badge } from "@/lib/components/badge";

const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

function SingleTokenView() {
  const { tokenId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [contentUrls, setContentUrls] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  
  const contentData = useSelector((state: RootState) => state.contentDisplay.contentData);
  const mintableState = useSelector((state: RootState) => state.contentDisplay.mintableState);
  const { nfts } = useSelector((state: RootState) => state.nftData);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let mounted = true;

    async function loadNFTData() {
      if (!tokenId) return;

      try {
        setIsLoading(true);
        console.log('Loading NFT data for tokenId:', tokenId);
        
        // Determine if this is an SBT by checking tokenId length
        const isSBT = tokenId.length > 80;
        
        // Convert SBT to OG NFT id if needed, then convert to arweave id
        const nftId = BigInt(tokenId);
        const ogId = isSBT ? await nft_manager.scion_to_og_id(nftId) : nftId;
        const arweaveId = natToArweaveId(ogId);
        
        console.log('Converted to arweaveId:', arweaveId);
        
        // Fetch transaction data with full details including tags
        const txData = await fetchTransactionById(arweaveId);
        console.log('Fetched transaction data:', txData);
        
        if (!txData) {
          console.error('Transaction not found for arweaveId:', arweaveId);
          toast.error('Transaction not found');
          return;
        }
        
        if (mounted) {
          setTransaction(txData);
          console.log('Set transaction in state:', txData);

          // Load content using ContentService
          const content = await ContentService.loadContent(txData);
          const urls = await ContentService.getContentUrls(txData, content);
          setContentUrls(urls);
          
          // Update content in Redux store
          dispatch(setContentData({ 
            id: txData.id, 
            content: {
              ...content,
              urls
            }
          }));
        }

        // Load NFT balances
        const subaccount = await nft_manager.to_nft_subaccount(nftId);
        const balanceParams = {
          owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
          subaccount: [Array.from(subaccount)] as [number[]]
        };

        const [alexBalance, lbryBalance] = await Promise.all([
          ALEX.icrc1_balance_of(balanceParams),
          LBRY.icrc1_balance_of(balanceParams)
        ]);

        console.log('Fetched balances:', { alex: alexBalance.toString(), lbry: lbryBalance.toString() });

        const convertE8sToToken = (e8sAmount: bigint): string => {
          return (Number(e8sAmount) / 1e8).toString();
        };

        if (mounted) {
          dispatch(updateNftBalances({
            tokenId,
            alex: convertE8sToToken(alexBalance),
            lbry: convertE8sToToken(lbryBalance),
            collection: isSBT ? 'SBT' : 'NFT'
          }));
        }
      } catch (error) {
        console.error('Failed to load NFT:', error);
        toast.error('Failed to load NFT data');
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

  const handleRenderError = (transactionId: string) => {
    ContentService.clearTransaction(transactionId);
    dispatch(setContentData({ 
      id: transactionId, 
      content: {
        url: null,
        textContent: null,
        imageObjectUrl: null,
        thumbnailUrl: null,
        error: 'Failed to render content'
      }
    }));
  };

  if (!tokenId) {
    console.log('No tokenId provided');
    return <div className="container mx-auto p-4 text-center">Invalid token ID</div>;
  }

  if (isLoading || !transaction || !contentUrls) {
    console.log('Still loading or no transaction:', { isLoading, transaction });
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  const nftData = nfts[tokenId];
  const content = contentData[transaction.id];

  console.log('Component state:', {
    tokenId,
    transaction,
    nftData,
    content,
    contentDataKeys: Object.keys(contentData)
  });
  
  if (!content) {
    console.error('Content not found:', {
      transactionId: transaction.id,
      availableContentIds: Object.keys(contentData),
      nftData
    });
    return <div className="container mx-auto p-4 text-center">Content not found</div>;
  }

  const handleMint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nftData = nfts[tokenId || ''];
    if (!nftData) return;
    
    try {
      setIsMinting(true);
      const message = await mint_nft(nftData.arweaveId);
      toast.success(message);
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsMinting(false);
    }
  };

  const handleWithdraw = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nftData = nfts[tokenId || ''];
    if (!nftData) return;
    
    try {
      setIsWithdrawing(true);
      const collection = nftData.collection === 'NFT' ? 'icrc7' : 'icrc7_scion';
      const [lbryBlock, alexBlock] = await withdraw_nft(tokenId || '', collection);
      
      if (lbryBlock === null && alexBlock === null) {
        toast.info("No funds were available to withdraw");
      } else {
        let message = "Successfully withdrew";
        if (lbryBlock !== null) message += " LBRY";
        if (alexBlock !== null) message += (lbryBlock !== null ? " and" : "") + " ALEX";
        toast.success(message);

        // Reload balances after withdrawal
        if (tokenId) {
          const subaccount = await nft_manager.to_nft_subaccount(BigInt(tokenId));
          const balanceParams = {
            owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
            subaccount: [Array.from(subaccount)] as [number[]]
          };

          const [alexBalance, lbryBalance] = await Promise.all([
            ALEX.icrc1_balance_of(balanceParams),
            LBRY.icrc1_balance_of(balanceParams)
          ]);

          const convertE8sToToken = (e8sAmount: bigint): string => {
            return (Number(e8sAmount) / 1e8).toString();
          };

          dispatch(updateNftBalances({
            tokenId,
            alex: convertE8sToToken(alexBalance),
            lbry: convertE8sToToken(lbryBalance)
          }));
        }
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isOwned = !!(user && nftData?.principal === user.principal);
  const hasWithdrawableBalance = isOwned && nftData && (
    parseFloat(nftData.balances?.alex || '0') > 0 || 
    parseFloat(nftData.balances?.lbry || '0') > 0
  );

  // Determine collection type based on tokenId length
  const collectionType = tokenId && tokenId.length > 80 ? 'SBT' : 'NFT';

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm">
        <ContentCard
          id={transaction.id}
          onClick={() => setShowModal(true)}
          owner={transaction.owner}
          showStats={false}
          isMintable={false}
          isOwned={isOwned}
          onMint={undefined}
          onWithdraw={hasWithdrawableBalance ? handleWithdraw : undefined}
          predictions={undefined}
          isMinting={isMinting}
        >
          <ContentRenderer
            transaction={transaction}
            content={content}
            contentUrls={contentUrls}
            showStats={false}
            mintableState={mintableState}
            handleRenderError={handleRenderError}
            inModal={false}
          />
        </ContentCard>
        <div className="flex flex-wrap gap-2 items-center p-2">
          <Badge variant="default" className={`text-xs ${
            collectionType === 'NFT' 
              ? 'bg-[#FFD700] text-black hover:bg-[#FFD700]/90' 
              : 'bg-[#E6E6FA] text-black hover:bg-[#E6E6FA]/90'
          }`}>
            {collectionType}
          </Badge>
          {nftData?.balances && (
            <>
              <Badge variant="outline" className="text-xs bg-white">
                ALEX: {nftData.balances.alex}
              </Badge>
              <Badge variant="outline" className="text-xs bg-white">
                LBRY: {nftData.balances.lbry}
              </Badge>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className="w-full h-full">
          <ContentRenderer
            transaction={transaction}
            content={content}
            contentUrls={contentUrls}
            inModal={true}
            showStats={false}
            mintableState={mintableState}
            handleRenderError={handleRenderError}
          />
        </div>
      </Modal>
    </div>
  );
}

export default SingleTokenView; 