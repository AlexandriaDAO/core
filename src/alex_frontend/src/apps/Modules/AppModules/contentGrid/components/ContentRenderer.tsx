import React from 'react';
import { LoaderPinwheel, BookOpen, File, Play } from 'lucide-react';
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import ContentValidator from './ContentValidator';
import { getFileIcon } from '../utils/fileIcons';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo, MintableState } from '../types';

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
      <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center gap-2">
        <File className="text-gray-500 text-4xl" />
        <LoaderPinwheel className="animate-spin text-4xl text-gray-500" />
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
            <img src={contentUrls.thumbnailUrl} alt="Book cover" {...commonProps} crossOrigin="anonymous" />
          ) : (
            <>
              <BookOpen className="text-gray-500 text-4xl absolute" />
              <LoaderPinwheel className="animate-spin text-4xl text-gray-500" />
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
              <img
                src={content.thumbnailUrl}
                alt="Video thumbnail"
                {...commonProps}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Play className="text-gray-500 text-4xl" />
              </div>
            )
          )}
        </div>
      ),
      "image/": (
        <img 
          src={content?.imageObjectUrl || contentUrls.thumbnailUrl || contentUrls.fullUrl} 
          alt="Content" 
          decoding="async"
          {...commonProps}
          crossOrigin="anonymous" 
        />
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
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-2 z-20">
          <p className="text-lg font-bold mb-2">Content Classification</p>
          <ul className="text-sm">
            {Object.entries(predictions).map(([key, value]) => (
              <li key={key}>{key}: {typeof value === 'number' ? (value * 100).toFixed(2) : 0}%</li>
            ))}
          </ul>
          {!isMintable && <p className="mt-2 text-red-400">This content is not mintable.</p>}
        </div>
      )}
    </div>
  );
};

export default React.memo(ContentRenderer);
