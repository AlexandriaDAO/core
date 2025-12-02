import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import ContentRenderer from '@/apps/Modules/AppModules/safeRender/ContentRenderer';
import { Button } from '@/lib/components/button';
import { Info } from 'lucide-react';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo } from '@/apps/Modules/AppModules/safeRender/types';

interface MainContentDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleDetails: () => void; // Callback to open/close the details panel
  transaction: Transaction | null;
  content: any | null;
  contentUrls: ContentUrlInfo | null;
  handleRenderError: (id: string) => void;
}

export const MainContentDisplayModal: React.FC<MainContentDisplayModalProps> = ({
  isOpen,
  onClose,
  onToggleDetails,
  transaction,
  content,
  contentUrls,
  handleRenderError,
}) => {
  // Early exit if not open or no transaction data
  if (!isOpen || !transaction) {
    return null;
  }

  const contentTypeTag = transaction?.tags.find((tag: { name: string; value: string }) =>
    tag.name === "Content-Type")?.value || 'unknown/unknown';

  const contentTypeFriendly = contentTypeTag.split('/')[0].toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-auto h-auto max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-background data-[state=open]:flex data-[state=open]:flex-col" // Allow flex layout for content sizing
        closeIcon={contentTypeTag === "application/epub+zip" ? null : undefined} // Keep EPUB specific logic
      >
        <DialogTitle className="sr-only">
          {contentTypeFriendly} Content Viewer
        </DialogTitle>

        {/* Button to toggle the details panel */}
        <Button
          variant="ghost"
          // size="icon" // Temporarily remove size to avoid linter issue, default should work with icon child
          onClick={onToggleDetails}
          className="absolute top-2 right-10 z-50 text-muted-foreground hover:text-foreground" // Position near the close button
          aria-label="Show details"
        >
          <Info className="h-5 w-5" />
        </Button>

        {/* Content Renderer Section - Removed padding from this div */}
        <div className="flex-grow overflow-auto"> 
          {content && contentUrls ? (
            <ContentRenderer
              key={transaction.id}
              transaction={transaction}
              content={content}
              contentUrls={contentUrls}
              inModal={true} // Still considered modal context for renderer
              handleRenderError={() => handleRenderError(transaction.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground p-4"> {/* Keep padding for loading/error state */}
              Loading content...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Optional: Export default if this is the main export
// export default MainContentDisplayModal; 