import React from 'react';
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import ContentRenderer from "@/apps/Modules/AppModules/safeRender/ContentRenderer";
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import { Badge } from "@/lib/components/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { Skeleton } from "@/lib/components/skeleton";
import { Copy, Check, Link, Database } from "lucide-react";
import { ShelfCardActionMenu } from './ShelfCardActionMenu';
import { useNftData } from '../hooks';
import { formatPrincipal, formatBalance } from '@/apps/Modules/shared/utils/tokenUtils';
import { copyToClipboard } from '@/apps/Modules/AppModules/contentGrid/utils/clipboard';

interface NftDisplayProps {
  tokenId: string;
  onViewDetails?: (tokenId: string) => void;
  inShelf?: boolean;
}

const NftDisplay: React.FC<NftDisplayProps> = ({ 
  tokenId, 
  onViewDetails, 
  inShelf = false 
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const {
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
  } = useNftData(tokenId);

  // Exit early if necessary data isn't loaded
  if (isLoading) {
    return <NftLoadingState />;
  }

  if (!transaction || !contentUrls || !content) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4">
        Content not found
      </div>
    );
  }

  const isOwned = !!(user && nftData?.principal === user.principal);
  const collectionType = nftData?.collection || 'NFT';

  // Handle copy functions
  const handleCopy = async (e: React.MouseEvent, type: 'principal' | 'link' | 'tokenId', value: string) => {
    e.stopPropagation();
    const copied = await copyToClipboard(value);
    if (copied) {
      setCopiedStates({ ...copiedStates, [type]: true });
      setTimeout(() => setCopiedStates({ ...copiedStates, [type]: false }), 2000);
    }
  };

  // Handler for card click
  const handleCardClick = () => {
    setShowModal(true);
    if (onViewDetails) {
      onViewDetails(tokenId);
    }
  };

  // Generate link for NFT
  const getNftLink = () => {
    return process.env.NODE_ENV === 'development' 
      ? `http://localhost:8080/nft/${tokenId}` 
      : `https://lbry.app/nft/${tokenId}`;
  };

  return (
    <>
      <ContentCard
        id={transaction.id}
        onClick={handleCardClick}
        owner={transaction.owner}
        isOwned={isOwned}
        component="Perpetua"
        footer={
          <NftFooter 
            tokenId={tokenId}
            nftData={nftData}
            ownerInfo={ownerInfo}
            copiedStates={copiedStates}
            collectionType={collectionType}
            handleCopy={handleCopy}
            getNftLink={getNftLink}
          />
        }
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

      <NftDetailModal 
        showModal={showModal} 
        setShowModal={setShowModal}
        transaction={transaction}
        content={content}
        contentUrls={contentUrls}
        handleRenderError={handleRenderError}
      />
    </>
  );
};

// Loading state component
const NftLoadingState = () => (
  <div className="flex flex-col space-y-4 p-4 h-full w-full">
    <Skeleton className="h-3/4 w-full rounded-md" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

// Footer component
interface NftFooterProps {
  tokenId: string;
  nftData: any;
  ownerInfo: any;
  copiedStates: {
    principal: boolean;
    link: boolean;
    tokenId: boolean;
  };
  collectionType: string;
  handleCopy: (e: React.MouseEvent, type: 'principal' | 'link' | 'tokenId', value: string) => void;
  getNftLink: () => string;
}

const NftFooter: React.FC<NftFooterProps> = ({
  tokenId,
  nftData,
  ownerInfo,
  copiedStates,
  collectionType,
  handleCopy,
  getNftLink
}) => (
  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
    <TooltipProvider>
      {/* Link button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
            onClick={(e) => handleCopy(e, 'link', getNftLink())}
          >
            {copiedStates.link ? (
              <Check className="h-2.5 w-2.5" />
            ) : (
              <Link className="h-2.5 w-2.5" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Copy NFT link</TooltipContent>
      </Tooltip>
      
      {/* Principal */}
      {nftData?.principal && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
              onClick={(e) => handleCopy(e, 'principal', nftData.principal)}
            >
              {formatPrincipal(nftData.principal)}
              {copiedStates.principal ? (
                <Check className="h-2.5 w-2.5" />
              ) : (
                <Copy className="h-2.5 w-2.5" />
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Copy principal ID</TooltipContent>
        </Tooltip>
      )}
      
      {/* Username */}
      {ownerInfo?.username && (
        <Badge 
          variant="secondary" 
          className="text-[10px] py-0.5 px-1"
        >
          @{ownerInfo.username}
        </Badge>
      )}
      
      {/* Collection type */}
      <Badge 
        variant={collectionType === 'NFT' ? 'warning' : 'info'} 
        className="text-[10px] py-0.5 px-1"
      >
        {collectionType}
      </Badge>
      
      {/* Balance badges */}
      {nftData?.balances && (
        <>
          <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
            ALEX: {formatBalance(nftData?.balances?.alex?.toString())}
          </Badge>
          
          <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
            LBRY: {formatBalance(nftData?.balances?.lbry?.toString())}
          </Badge>
        </>
      )}
      
      {/* Token ID */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
            onClick={(e) => handleCopy(e, 'tokenId', tokenId)}
          >
            <Database className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {tokenId.length <= 4 ? tokenId : `${tokenId.slice(0, 2)}...${tokenId.slice(-2)}`}
            </span>
            {copiedStates.tokenId ? (
              <Check className="h-2.5 w-2.5 text-green-500" />
            ) : (
              <Copy className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Copy token ID</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

// Modal component
interface NftDetailModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  transaction: any;
  content: any;
  contentUrls: any;
  handleRenderError: (transactionId?: string) => void;
}

const NftDetailModal: React.FC<NftDetailModalProps> = ({
  showModal,
  setShowModal,
  transaction,
  content,
  contentUrls,
  handleRenderError
}) => (
  <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
    <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
      <DialogTitle className="sr-only">NFT Viewer</DialogTitle>
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
);

export default NftDisplay; 