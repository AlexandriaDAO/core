import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ContentRenderer from '../safeRender/ContentRenderer';
import { ContentCard } from '@/apps/Modules/AppModules/contentGrid/Card';
import { Dialog, DialogContent } from '@/lib/components/dialog';
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
import { natToArweaveId } from '@/utils/id_convert';
import { fetchTransactionById } from '../../LibModules/arweaveSearch/api/directArweaveClient';
import { ContentService } from '../../LibModules/contentDisplay/services/contentService';
import { setContentData } from '../../shared/state/content/contentDisplaySlice';
import { Transaction } from '../../shared/types/queries';
import { Badge } from "@/lib/components/badge";
import { Copy, Check, Link, X } from "lucide-react";
import { copyToClipboard } from '@/apps/Modules/AppModules/contentGrid/utils/clipboard';
import { getNftOwnerInfo, UserInfo } from '../../shared/utils/nftOwner';
import { setNFTs } from '../../shared/state/nftData/nftDataSlice';
import { Button } from "@/lib/components/button";

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
  
  const contentData = useSelector((state: RootState) => state.contentDisplay.contentData);
  const { nfts } = useSelector((state: RootState) => state.nftData);
  const { user } = useSelector((state: RootState) => state.auth);

  const formatPrincipal = (principal: string | null) => {
    if (!principal) return 'Not owned';
    return `${principal.slice(0, 4)}...${principal.slice(-4)}`;
  };

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return '0';
    return balance;
  };

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

        const convertE8sToToken = (e8sAmount: bigint): string => {
          return (Number(e8sAmount) / 1e8).toString();
        };

        if (mounted) {
          const alexTokens = convertE8sToToken(alexBalance);
          const lbryTokens = convertE8sToToken(lbryBalance);

          // Initialize NFT data in the store
          dispatch(setNFTs({
            [tokenId]: {
              collection: isSBT ? 'SBT' : 'NFT',
              principal: '', // Using empty string instead of null
              arweaveId: arweaveId,
              balances: { alex: alexTokens, lbry: lbryTokens }
            }
          }));
          
          dispatch(updateNftBalances({
            tokenId,
            alex: alexTokens,
            lbry: lbryTokens,
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
          variant="default" 
          className="text-xs cursor-pointer hover:bg-primary/80 transition-colors flex items-center gap-1"
          onClick={handleCopyLink}
        >
          {copiedLink ? (
            <Check className="h-3 w-3" />
          ) : (
            <Link className="h-3 w-3" />
          )}
        </Badge>
        {nftData?.principal && (
          <Badge 
            variant="default" 
            className="text-xs cursor-pointer hover:bg-primary/80 transition-colors flex items-center gap-1"
            onClick={handleCopyPrincipal}
          >
            {formatPrincipal(nftData.principal)}
            {copiedPrincipal ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Badge>
        )}
        {ownerInfo?.username && (
          <Badge 
            variant="default" 
            className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200"
          >
            @{ownerInfo.username}
          </Badge>
        )}
        <Badge variant="default" className={`text-xs ${
          collectionType === 'NFT' 
            ? 'bg-[#FFD700] text-black hover:bg-[#FFD700]/90' 
            : 'bg-[#E6E6FA] text-black hover:bg-[#E6E6FA]/90'
        }`}>
          {collectionType}
        </Badge>
        <Badge variant="outline" className="text-xs bg-white">
          ALEX: {formatBalance(nftData?.balances?.alex?.toString())}
        </Badge>
        <Badge variant="outline" className="text-xs bg-white">
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
        <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col" closeIcon={
          <Button
            variant="outline"
            className="absolute right-4 top-4 z-[60] rounded-full p-3 
              bg-primary text-primary-foreground hover:bg-primary/90
              transition-colors"
          >
            <X className="h-6 w-6" />
          </Button>
        }>
          <div className="w-full h-full overflow-y-auto">
            <div className="p-6">
              <ContentRenderer
                transaction={transaction}
                content={content}
                contentUrls={contentUrls}
                inModal={true}
                handleRenderError={handleRenderError}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SingleTokenView; 