import React from 'react';
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import ContentRenderer from "@/apps/Modules/AppModules/safeRender/ContentRenderer";
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { Skeleton } from "@/lib/components/skeleton";
import { Copy, Check, Link, Database } from "lucide-react";
import { useNftData } from '../hooks';
import { copyToClipboard } from '@/apps/Modules/AppModules/contentGrid/utils/clipboard';
import { UnifiedCardActions } from '@/apps/Modules/shared/components/UnifiedCardActions/UnifiedCardActions';

interface NftDisplayProps {
  tokenId: string;
  onViewDetails?: (tokenId: string) => void;
  inShelf?: boolean;
  parentShelfId?: string;
  itemId?: number;
  currentShelfId?: string;
}

const NftDisplay: React.FC<NftDisplayProps> = ({ 
  tokenId, 
  onViewDetails, 
  inShelf = false,
  parentShelfId,
  itemId,
  currentShelfId
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

  // Handler for dialog open/close - same pattern as Grid.tsx
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setShowModal(false);
    }
  };

  // Handler for card click
  const handleCardClick = () => {
    console.log('handleCardClick');
    setShowModal(true);
    
    if (onViewDetails) {
      onViewDetails(tokenId);
    }
  };

  // Add logging right before rendering ContentCard
  console.log(`NftDisplay [${tokenId}]: Rendering ContentCard with initialContentType="Nft"`);

  return (
    <>
      <ContentCard
        id={transaction.id}
        onClick={handleCardClick}
        owner={transaction.owner}
        component="Perpetua"
        parentShelfId={parentShelfId}
        itemId={itemId}
        currentShelfId={currentShelfId}
        initialContentType="Nft"
      >
        <ContentRenderer
          transaction={transaction}
          content={content}
          contentUrls={contentUrls}
          handleRenderError={handleRenderError}
          inModal={false}
        />
      </ContentCard>

      {/* This Dialog follows the same pattern as Grid.tsx */}
      <Dialog open={showModal} onOpenChange={handleDialogOpenChange}>
        <DialogContent 
          className="w-auto h-auto max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-background"
          closeIcon={transaction.tags.find((tag: { name: string; value: string }) => 
            tag.name === "Content-Type")?.value === "application/epub+zip" ? null : undefined}
        >
          <DialogTitle className="sr-only">
            {transaction.tags.find((tag: { name: string; value: string }) => 
              tag.name === "Content-Type")?.value.split('/')[0].toUpperCase()} Content Viewer
          </DialogTitle>
          
          {content && (
            <div className="w-full h-full">
              <ContentRenderer
                key={transaction.id}
                transaction={transaction}
                content={content}
                contentUrls={contentUrls}
                inModal={true}
                handleRenderError={() => handleRenderError(transaction.id)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
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

export default NftDisplay; 