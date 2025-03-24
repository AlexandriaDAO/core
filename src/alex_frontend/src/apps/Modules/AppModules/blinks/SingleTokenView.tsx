import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ContentRenderer from '../safeRender/ContentRenderer';
import { ContentCard } from '@/apps/Modules/AppModules/contentGrid/Card';
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
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
import { fetchTransactionById } from '../../LibModules/arweaveSearch/api/directArweaveClient';
import { ContentService } from '../../LibModules/contentDisplay/services/contentService';
import { setContentData } from '../../shared/state/transactions/transactionSlice';
import { Transaction } from '../../shared/types/queries';
import { Badge } from "@/lib/components/badge";
import { Copy, Check, Link, X } from "lucide-react";
import { copyToClipboard } from '@/apps/Modules/AppModules/contentGrid/utils/clipboard';
import { getNftOwnerInfo, UserInfo } from '../../shared/utils/nftOwner';
import { setNFTs } from '../../shared/state/nftData/nftDataSlice';
import { Button } from "@/lib/components/button";
import { convertE8sToToken, formatPrincipal, formatBalance } from '../../shared/utils/tokenUtils';
import { createTokenAdapter, determineTokenType, TokenType } from '../../shared/adapters/TokenAdapter';

const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

function SingleTokenView() {
  const { tokenId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [contentUrls, setContentUrls] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<UserInfo | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  
  const contentData = useSelector((state: RootState) => state.transactions.contentData);
  const { nfts } = useSelector((state: RootState) => state.nftData);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let mounted = true;
    
    async function loadNFTData() {
      if (!tokenId) return;
      
      try {
        setIsLoading(true);
        let nft = nfts[tokenId];
        
        if (!nft || !nft.arweaveId) {
          console.log('NFT not found in Redux store, fetching directly...', tokenId);
          // If NFT data isn't in the Redux store, fetch it directly
          const tokenType = determineTokenType(tokenId);
          const tokenAdapter = createTokenAdapter(tokenType);
          const nftId = BigInt(tokenId);
          
          // Get owner info
          const ownerResult = await tokenAdapter.getOwnerOf([nftId]);
          let ownerPrincipal = '';
          
          if (ownerResult && ownerResult.length > 0 && ownerResult[0] && ownerResult[0].length > 0) {
            ownerPrincipal = ownerResult[0][0]?.owner.toString() || '';
          }
          
          // Get NFT data
          const nftData = await tokenAdapter.tokenToNFTData(nftId, ownerPrincipal);
          
          // Add to Redux store
          dispatch(setNFTs({
            [tokenId]: nftData
          }));
          
          nft = nftData;
          
          // Fetch balances
          const subaccount = await nft_manager.to_nft_subaccount(nftId);
          const balanceParams = {
            owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
            subaccount: [Array.from(subaccount)] as [number[]]
          };

          const [alexBalance, lbryBalance] = await Promise.all([
            ALEX.icrc1_balance_of(balanceParams),
            LBRY.icrc1_balance_of(balanceParams)
          ]);

          dispatch(updateNftBalances({
            tokenId,
            alex: convertE8sToToken(alexBalance),
            lbry: convertE8sToToken(lbryBalance),
            collection: tokenType
          }));
        }
        
        if (!nft || !nft.arweaveId) {
          console.error('Unable to fetch NFT data for tokenId:', tokenId);
          toast.error('Unable to fetch NFT data');
          setIsLoading(false);
          return;
        }
        
        const txData = await fetchTransactionById(nft.arweaveId);
        
        if (!txData) {
          console.error('Transaction not found for arweaveId:', nft.arweaveId);
          toast.error('Transaction not found');
          return;
        }
        
        if (mounted) {
          setTransaction(txData);
          
          const content = await ContentService.loadContent(txData);
          const urls = await ContentService.getContentUrls(txData, content);
          setContentUrls(urls);
          
          dispatch(setContentData({ 
            id: txData.id, 
            content: {
              ...content,
              urls
            }
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
  }, [tokenId, dispatch, nfts]);

  useEffect(() => {
    let mounted = true;
    
    async function loadOwnerInfo() {
      if (!tokenId) return;
      
      try {
        const info = await getNftOwnerInfo(tokenId);
        if (mounted) {
          setOwnerInfo(info);
        }
      } catch (error) {
        console.error('Failed to load owner info:', error);
      }
    }
    
    loadOwnerInfo();
    
    return () => {
      mounted = false;
    };
  }, [tokenId]);

  const handleRenderError = (transactionId: string) => {
    ContentService.clearTransaction(transactionId);
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

  const collectionType = nftData?.collection || 'NFT';

  const handleCopyPrincipal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nftData?.principal) return;
    
    const copied = await copyToClipboard(nftData.principal);
    if (copied) {
      setCopiedPrincipal(true);
      setTimeout(() => setCopiedPrincipal(false), 2000);
      toast.success('Copied principal to clipboard');
    } else {
      toast.error('Failed to copy principal');
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tokenId) return;
    
    const lbryUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:8080/nft/${tokenId}` 
      : `https://lbry.app/nft/${tokenId}`;
    const copied = await copyToClipboard(lbryUrl);
    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success('Copied link to clipboard');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const CustomFooter = () => (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
        <Badge 
          variant="secondary" 
          className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
          onClick={handleCopyLink}
        >
          {copiedLink ? (
            <Check className="h-2.5 w-2.5" />
          ) : (
            <Link className="h-2.5 w-2.5" />
          )}
        </Badge>
        {nftData?.principal && (
          <Badge 
            variant="secondary" 
            className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
            onClick={handleCopyPrincipal}
          >
            {formatPrincipal(nftData.principal)}
            {copiedPrincipal ? (
              <Check className="h-2.5 w-2.5" />
            ) : (
              <Copy className="h-2.5 w-2.5" />
            )}
          </Badge>
        )}
        {ownerInfo?.username && (
          <Badge 
            variant="secondary" 
            className="text-[10px] py-0.5 px-1"
          >
            @{ownerInfo.username}
          </Badge>
        )}
        <Badge 
          variant={collectionType === 'NFT' ? 'warning' : 'info'} 
          className="text-[10px] py-0.5 px-1"
        >
          {collectionType}
        </Badge>
        <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
          ALEX: {formatBalance(nftData?.balances?.alex?.toString())}
        </Badge>
        <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
          LBRY: {formatBalance(nftData?.balances?.lbry?.toString())}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm">
        <ContentCard
          id={transaction.id}
          onClick={() => setShowModal(true)}
          owner={transaction.owner}
          isOwned={isOwned}
          onMint={undefined}
          onWithdraw={hasWithdrawableBalance ? handleWithdraw : undefined}
          predictions={undefined}
          isMinting={isMinting}
          footer={<CustomFooter />}
        >
          <ContentRenderer
            transaction={transaction}
            content={content}
            contentUrls={contentUrls}
            handleRenderError={handleRenderError}
            inModal={false}
          />
        </ContentCard>
      </div>

      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Content Viewer</DialogTitle>

          <div className="w-full h-full overflow-y-auto">
            <div className="p-6">
              {content && transaction && (
                <ContentRenderer
                  key={transaction.id}
                  transaction={transaction}
                  content={content}
                  contentUrls={contentUrls}
                  inModal={true}
                  handleRenderError={handleRenderError}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SingleTokenView;