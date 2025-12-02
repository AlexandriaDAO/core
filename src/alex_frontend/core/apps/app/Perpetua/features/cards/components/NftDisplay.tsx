import React, { useState, useCallback } from 'react';
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import ContentRenderer from "@/apps/Modules/AppModules/safeRender/ContentRenderer";
import { Skeleton } from "@/lib/components/skeleton";
import { useNftData } from '../hooks';
import { MainContentDisplayModal } from '@/apps/Modules/shared/components/MainContentDisplayModal/MainContentDisplayModal';
import { AttachedDetailsPanel } from '@/apps/Modules/shared/components/AttachedDetailsPanel/AttachedDetailsPanel';

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
  const { predictions } = useSelector((state: RootState) => state.arweave);
  
  const {
    isLoading,
    transaction,
    contentUrls,
    ownerInfo,
    nftData,
    content,
    handleRenderError
  } = useNftData(tokenId);

  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

  const handleOpenMainModal = useCallback(() => {
    if (!transaction) return;
    setIsMainModalOpen(true);
    setIsDetailsPanelOpen(false);
    if (onViewDetails) {
      onViewDetails(tokenId);
    }
  }, [transaction, onViewDetails, tokenId]);

  const handleCloseMainModal = useCallback(() => {
    setIsMainModalOpen(false);
    setIsDetailsPanelOpen(false);
  }, []);

  const handleToggleDetailsPanel = useCallback(() => {
    setIsDetailsPanelOpen(prev => !prev);
  }, []);

  const handleCloseDetailsPanel = useCallback(() => {
    setIsDetailsPanelOpen(false);
  }, []);

  if (isLoading) {
    return <NftLoadingState />;
  }

  const currentPredictions = transaction ? predictions[transaction.id] : undefined;

  return (
    <>
      <ContentCard
        id={transaction?.id || tokenId}
        onClick={transaction ? handleOpenMainModal : undefined}
        owner={transaction?.owner}
        component="Perpetua"
        parentShelfId={parentShelfId}
        itemId={itemId}
        currentShelfId={currentShelfId}
        initialContentType="Nft"
      >
        {transaction && content && contentUrls ? (
          <div className="group relative w-full h-full">
            <ContentRenderer
              transaction={transaction}
              content={content}
              contentUrls={contentUrls}
              handleRenderError={handleRenderError}
              inModal={false}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {isLoading ? 'Loading NFT data...' : 'NFT data unavailable'}
          </div>
        )}
      </ContentCard>

      {transaction && (
        <>
          <MainContentDisplayModal 
            isOpen={isMainModalOpen}
            onClose={handleCloseMainModal}
            onToggleDetails={handleToggleDetailsPanel}
            transaction={transaction}
            content={content}
            contentUrls={contentUrls}
            handleRenderError={handleRenderError}
          />
          <AttachedDetailsPanel
            isOpen={isDetailsPanelOpen}
            onClose={handleCloseDetailsPanel}
            transaction={transaction}
            predictions={currentPredictions}
          />
        </>
      )}
    </>
  );
};

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