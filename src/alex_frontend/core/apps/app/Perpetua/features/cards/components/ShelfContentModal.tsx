import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import ContentRenderer from '@/apps/Modules/AppModules/safeRender/ContentRenderer';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo } from '@/apps/Modules/AppModules/safeRender/types';
import TransactionDetails from '@/apps/Modules/AppModules/contentGrid/components/TransactionDetails';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface ViewingItemContent {
  itemId: number;
  content: any;
  nftId?: string;
  contentUrls?: ContentUrlInfo;
}

interface ShelfContentModalProps {
  viewingItemContent: ViewingItemContent | null;
  onClose: () => void;
  shelfOwner: string;
}

export const ShelfContentModal: React.FC<ShelfContentModalProps> = ({
  viewingItemContent,
  onClose,
  shelfOwner
}) => {
  const { predictions } = useSelector((state: RootState) => state.arweave);

  if (!viewingItemContent) return null;

  const handleRenderError = (id: string) => {
    console.error("Error rendering content:", id);
    ContentService.clearTransaction(id || `item-${viewingItemContent.itemId}`);
  };

  const getArweaveId = (): string | undefined => {
    if (viewingItemContent?.content && typeof viewingItemContent.content === 'object' && 'Nft' in viewingItemContent.content) {
      return viewingItemContent.content.Nft;
    }
    return viewingItemContent?.nftId;
  };

  const arweaveId = getArweaveId();
  const currentPredictions = arweaveId ? predictions[arweaveId] : undefined;

  const mockTransaction: Transaction | null = arweaveId ? {
    id: arweaveId,
    owner: shelfOwner,
    tags: [],
  } : null;

  const getContentUrls = (): ContentUrlInfo => {
    if (viewingItemContent?.contentUrls) {
      return viewingItemContent.contentUrls;
    }
    if (viewingItemContent?.content?.urls) {
      return viewingItemContent.content.urls;
    }
    if (arweaveId) {
      return {
        fullUrl: `https://arweave.net/${arweaveId}`,
        coverUrl: null,
        thumbnailUrl: null
      };
    }
    return {
      fullUrl: '',
      coverUrl: null,
      thumbnailUrl: null
    };
  };

  const finalContentUrls = getContentUrls();

  const showDetails = !!arweaveId;

  return (
    <Dialog open={!!viewingItemContent} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row">
        <DialogTitle className="sr-only">Content Viewer</DialogTitle>
        
        <div className={`w-full ${showDetails ? 'md:w-3/4' : 'md:w-full'} h-full overflow-auto`}>
          <div className="p-1 md:p-4">
            <ContentRenderer
              key={arweaveId || `item-${viewingItemContent.itemId}`}
              transaction={mockTransaction || { id: `item-${viewingItemContent.itemId}`, owner: shelfOwner, tags: [] }}
              content={viewingItemContent.content}
              contentUrls={finalContentUrls}
              handleRenderError={() => handleRenderError(arweaveId || `item-${viewingItemContent.itemId}`)}
              inModal={true}
            />
          </div>
        </div>

        {showDetails && arweaveId && mockTransaction && (
          <div className="w-full md:w-1/4 h-full overflow-y-auto bg-black/20 p-2 border-t md:border-t-0 md:border-l border-gray-700">
            <h3 className="text-sm font-semibold mb-2 text-white px-1">Details</h3>
            <TransactionDetails 
              transaction={mockTransaction}
              predictions={currentPredictions}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShelfContentModal; 