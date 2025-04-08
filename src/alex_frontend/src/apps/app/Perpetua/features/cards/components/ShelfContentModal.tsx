import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import ContentRenderer from "@/apps/Modules/AppModules/safeRender/ContentRenderer";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo } from '@/apps/Modules/AppModules/safeRender/types';

interface ViewingItemContent {
  itemId: number;
  content: any;
  transaction: Transaction | null;
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
  if (!viewingItemContent) return null;

  const handleRenderError = (id: string) => {
    console.error("Error rendering content:", id);
    ContentService.clearTransaction(id);
  };

  // Ensure we always have valid contentUrls
  const getContentUrls = (): ContentUrlInfo => {
    return viewingItemContent.content?.urls || viewingItemContent.contentUrls || {
      fullUrl: '',
      coverUrl: null,
      thumbnailUrl: null
    };
  };

  return (
    <Dialog open={!!viewingItemContent} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">NFT Content Viewer</DialogTitle>
        
        <div className="w-full h-full overflow-y-auto">
          <div className="p-6">
            {viewingItemContent.transaction ? (
              <ContentRenderer
                key={viewingItemContent.transaction.id}
                transaction={viewingItemContent.transaction}
                content={viewingItemContent.content}
                contentUrls={getContentUrls()}
                handleRenderError={() => handleRenderError(viewingItemContent.transaction?.id || '')}
                inModal={true}
              />
            ) : (
              <ContentRenderer
                key={`item-${viewingItemContent.itemId}`}
                transaction={{
                  id: `generic-${viewingItemContent.itemId}`,
                  owner: shelfOwner,
                  tags: []
                }}
                content={viewingItemContent.content}
                contentUrls={getContentUrls()}
                handleRenderError={() => console.error("Error rendering NFT content")}
                inModal={true}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShelfContentModal; 