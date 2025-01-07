import React from 'react';
import { LoaderPinwheel, BookOpen, File, Play } from 'lucide-react';
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import ContentValidator from './ContentValidator';
import { getFileIcon } from '../utils/fileIcons';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo, MintableState } from '../types';
import { Progress } from "@/lib/components/progress";
import { Skeleton } from "@/lib/components/skeleton";
import { AspectRatio } from "@/lib/components/aspect-ratio";

interface ContentRendererProps {
  transaction: Transaction;
  content: any;
  inModal?: boolean;
  contentUrls: ContentUrlInfo;
  showStats: boolean;
  mintableState: MintableState;
  handleRenderError: (id: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  transaction,
  content,
  inModal = false,
  contentUrls,
  showStats,
  mintableState,
  handleRenderError,
}) => {
  const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
  const mintableStateItem = mintableState[transaction.id];
  const isMintable = mintableStateItem?.mintable;
  const predictions = mintableStateItem?.predictions;

  const hasError = !content || content.error;
  if (hasError) {
    return (
      <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center gap-4">
        <File className="text-gray-500 text-4xl" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  const commonProps = {
    className: `${inModal ? 'w-full h-full sm:object-cover xs:object-fill rounded-xl' : 'absolute inset-0 w-full h-full object-cover'}`,
    onError: () => handleRenderError(transaction.id),
  };

  const renderContent = () => {    
    if (contentType === "application/epub+zip") {
      if (inModal) {
        return (
          <ReaderProvider>
            <div className="h-full pt-8">
              <Reader bookUrl={contentUrls.fullUrl} />
            </div>
          </ReaderProvider>
        );
      }
      return (
        <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
          {contentUrls.thumbnailUrl ? (
            <AspectRatio ratio={1}>
              <img src={contentUrls.thumbnailUrl} alt="Book cover" {...commonProps} crossOrigin="anonymous" />
            </AspectRatio>
          ) : (
            <>
              <BookOpen className="text-gray-500 text-4xl absolute" />
              <Skeleton className="h-8 w-32" />
            </>
          )}
        </div>
      );
    }

    const contentMap = {
      "video/": (
        <div className="relative w-full h-full">
          {inModal ? (
            <video 
              src={contentUrls.fullUrl}
              controls
              {...commonProps}
            />
          ) : (
            content?.thumbnailUrl ? (
              <AspectRatio ratio={1}>
                <img
                  src={content.thumbnailUrl}
                  alt="Video thumbnail"
                  {...commonProps}
                  crossOrigin="anonymous"
                />
              </AspectRatio>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Play className="text-gray-500 text-4xl" />
              </div>
            )
          )}
        </div>
      ),
      "image/": (
        <AspectRatio ratio={1}>
          <img 
            src={content?.imageObjectUrl || contentUrls.thumbnailUrl || contentUrls.fullUrl} 
            alt="Content" 
            decoding="async"
            {...commonProps}
            crossOrigin="anonymous" 
          />
        </AspectRatio>
      ),
      "application/pdf": (
        <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
          <File className="text-gray-500 text-4xl absolute" />
          {inModal && (
            <embed 
              src={`${contentUrls.fullUrl}#view=FitH&page=1`} 
              type="application/pdf" 
              {...commonProps}
            />
          )}
        </div>
      ),
    };

    return Object.entries(contentMap).find(([key]) => contentType.startsWith(key))?.[1] || (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        {getFileIcon(contentType)}
      </div>
    );
  };

  return (
    <div className={`relative ${inModal ? 'w-full h-full' : 'w-full h-full'}`}>
      <ContentValidator
        transactionId={transaction.id}
        contentUrl={content.url || ''}
        contentType={contentType}
        imageObjectUrl={content.imageObjectUrl || ''}
      />
      {renderContent()}
      {(showStats || !isMintable) && predictions && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-4 z-20">
          <p className="text-lg font-bold mb-4">Content Classification</p>
          <div className="space-y-3 w-full max-w-sm">
            {Object.entries(predictions).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{key}</span>
                  <span>{(Number(value) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={Number(value) * 100} className="h-1" />
              </div>
            ))}
          </div>
          {!isMintable && (
            <p className="mt-4 text-red-400 text-sm">This content is not mintable.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ContentRenderer);
