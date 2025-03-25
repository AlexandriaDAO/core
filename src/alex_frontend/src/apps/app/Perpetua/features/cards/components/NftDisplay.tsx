import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import ContentRenderer from "@/apps/Modules/AppModules/safeRender/ContentRenderer";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { Badge } from "@/lib/components/badge";
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import { toast } from "sonner";
import { Principal } from '@dfinity/principal';
import { ALEX } from '@/../../declarations/ALEX';
import { LBRY } from '@/../../declarations/LBRY';
import { nft_manager } from '@/../../declarations/nft_manager';
import { updateNftBalances, setNFTs } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { setContentData } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { fetchTransactionById } from '@/apps/Modules/LibModules/arweaveSearch/api/directArweaveClient';
import { copyToClipboard } from '@/apps/Modules/AppModules/contentGrid/utils/clipboard';
import { Check, Link, Database, Copy } from "lucide-react";
import { getNftOwnerInfo } from '@/apps/Modules/shared/utils/nftOwner';
import { formatPrincipal, formatBalance, convertE8sToToken } from '@/apps/Modules/shared/utils/tokenUtils';
import { createTokenAdapter, determineTokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { ShelfCardActionMenu } from './ShelfCardActionMenu';

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

// NFT Token Display Component
const NftDisplay = ({ tokenId, onViewDetails, inShelf = false }: { 
  tokenId: string; 
  onViewDetails?: (tokenId: string) => void;
  inShelf?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [contentUrls, setContentUrls] = useState<any>(null);
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const contentData = useSelector((state: RootState) => state.transactions.contentData);
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const { user } = useSelector((state: RootState) => state.auth);

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
        
        let ogId: bigint;
        if (tokenType === 'SBT') {
          ogId = await nft_manager.scion_to_og_id(nftId);
        } else {
          ogId = nftId;
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
          const info = await getNftOwnerInfo(tokenId);
          setOwnerInfo(info);
        }

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

        if (mounted) {
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

  // Copy handlers
  const handleCopyPrincipal = async (e: React.MouseEvent, principal: string) => {
    e.stopPropagation();
    const copied = await copyToClipboard(principal);
    if (copied) {
      setCopiedPrincipal(true);
      setTimeout(() => setCopiedPrincipal(false), 2000);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const lbryUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:8080/nft/${tokenId}` 
      : `https://lbry.app/nft/${tokenId}`;
    const copied = await copyToClipboard(lbryUrl);
    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyTokenId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const copied = await copyToClipboard(tokenId);
    if (copied) {
      setCopiedTokenId(true);
      setTimeout(() => setCopiedTokenId(false), 2000);
    }
  };

  if (isLoading || !transaction || !contentUrls) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <svg className="animate-spin h-8 w-8 mb-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs text-center">Loading NFT...</span>
      </div>
    );
  }

  const nftData = nfts[tokenId];
  const content = contentData[transaction.id];
  
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4">
        Content not found
      </div>
    );
  }

  const isOwned = !!(user && nftData?.principal === user.principal);
  const collectionType = nftData?.collection || 'NFT';

  // NFT Footer - now a reusable component
  const NftFooter = () => (
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
          onClick={(e) => handleCopyPrincipal(e, nftData.principal)}
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
      
      {/* Token ID badge */}
      <Badge 
        variant="secondary" 
        className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
        onClick={handleCopyTokenId}
        title={`Token ID: ${tokenId}`}
      >
        <Database className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-600 dark:text-gray-400">
          {tokenId.length <= 4 ? tokenId : `${tokenId.slice(0, 2)}...${tokenId.slice(-2)}`}
        </span>
        {copiedTokenId ? (
          <Check className="h-2.5 w-2.5 text-green-500" />
        ) : (
          <Copy className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
        )}
      </Badge>
    </div>
  );

  // Handle click to open modal
  const handleCardClick = () => {
    setShowModal(true);
    // Still call the original handler if provided (for other functionality)
    if (onViewDetails) {
      onViewDetails(tokenId);
    }
  };

  // Render the NFT Card
  return (
    <>
      <ContentCard
        id={transaction.id}
        onClick={handleCardClick}
        owner={transaction.owner}
        isOwned={isOwned}
        component="Perpetua"
        footer={<NftFooter />}
      >
        <div className="relative w-full h-full">
          {!inShelf && (
            <ShelfCardActionMenu
              contentId={tokenId}
              contentType="Nft"
              className="top-2 right-2"
            />
          )}
          
          <ContentRenderer
            transaction={transaction}
            content={content}
            contentUrls={contentUrls}
            handleRenderError={handleRenderError}
            inModal={false}
          />
        </div>
      </ContentCard>

      {/* Modal Dialog for viewing NFT - similar to SingleTokenView */}
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
                  handleRenderError={() => handleRenderError(transaction.id)}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NftDisplay; 