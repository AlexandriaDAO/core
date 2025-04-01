import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import ContentRenderer from "@/apps/Modules/AppModules/safeRender/ContentRenderer";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { BlogMarkdownDisplay } from './ContentDisplays';
import { isMarkdownContentSafe, getMarkdownContentSafe } from '../utils/ShelfViewUtils';

interface ContentUrls {
  fullUrl: string;
  coverUrl: string | null;
  thumbnailUrl: string | null;
}

interface ViewingItemContent {
  itemId: number;
  content: any;
  transaction: Transaction | null;
  contentUrls?: ContentUrls;
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
  // Handler for rendering error
  const handleRenderError = (id: string) => {
    console.error("Error rendering content:", id);
    ContentService.clearTransaction(id);
  };

  if (!viewingItemContent) {
    return null;
  }

  return (
    <Dialog open={!!viewingItemContent} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">Content Viewer</DialogTitle>
        
        <div className="w-full h-full overflow-y-auto">
          <div className="p-6">
            {viewingItemContent.transaction && (
              <ContentRenderer
                key={viewingItemContent.transaction.id}
                transaction={viewingItemContent.transaction}
                content={viewingItemContent.content}
                contentUrls={
                  (viewingItemContent.content?.urls) || {
                    fullUrl: `data:text/markdown;charset=utf-8,${encodeURIComponent(
                      isMarkdownContentSafe(viewingItemContent.content) 
                        ? getMarkdownContentSafe(viewingItemContent.content)
                        : JSON.stringify(viewingItemContent.content || {}, null, 2)
                    )}`,
                    thumbnailUrl: null,
                    coverUrl: null
                  }
                }
                handleRenderError={() => handleRenderError(viewingItemContent.transaction?.id || '')}
                inModal={true}
              />
            )}
            {!viewingItemContent.transaction && isMarkdownContentSafe(viewingItemContent.content) && (
              <BlogMarkdownDisplay
                content={getMarkdownContentSafe(viewingItemContent.content)}
                onClick={() => {}}
              />
            )}
            {!viewingItemContent.transaction && !isMarkdownContentSafe(viewingItemContent.content) && viewingItemContent.contentUrls && (
              <ContentRenderer
                key={`item-${viewingItemContent.itemId}`}
                transaction={{
                  id: `generic-${viewingItemContent.itemId}`,
                  owner: shelfOwner,
                  tags: []
                }}
                content={viewingItemContent.content}
                contentUrls={viewingItemContent.contentUrls}
                handleRenderError={() => console.error("Error rendering non-transaction content")}
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