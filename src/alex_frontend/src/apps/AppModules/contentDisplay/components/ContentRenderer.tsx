import React from 'react';
import { FaSpinner, FaBook, FaFilePdf } from 'react-icons/fa';
import { ContentDataItem, ContentUrlInfo } from '../types/content.types';
import { Transaction } from '../../arweave/types/queries';
import ContentValidator from '../../arweave/components/nsfwjs/ContentValidator';
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { getFileIcon } from '../utils/contentHelpers';

interface ContentRendererProps {
  transaction: Transaction;
  content?: ContentDataItem;
  urlInfo: ContentUrlInfo;
  inModal?: boolean;
  showStats?: boolean;
  isMintable?: boolean;
  predictions?: Record<string, number>;
  onRenderError: (id: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  transaction,
  content,
  urlInfo,
  inModal = false,
  showStats = false,
  isMintable = true,
  predictions,
  onRenderError,
}) => {
  const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";

  if (!content) {
    return <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      <FaSpinner className="animate-spin text-4xl text-gray-500" />
    </div>;
  }

  const commonProps = {
    className: `${inModal ? 'w-full h-full object-contain' : 'absolute inset-0 w-full h-full object-cover'}`,
    onError: () => onRenderError(transaction.id),
  };

  const renderEpub = () => {
    if (inModal) {
      return (
        <ReaderProvider>
          <div className="h-full pt-8">
            <Reader bookUrl={urlInfo.fullUrl} />
          </div>
        </ReaderProvider>
      );
    }
    return (
      <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
        {urlInfo.thumbnailUrl ? (
          <img src={urlInfo.thumbnailUrl} alt="Book cover" {...commonProps} crossOrigin="anonymous" />
        ) : (
          <>
            <FaBook className="text-gray-500 text-4xl absolute" />
            <FaSpinner className="animate-spin text-4xl text-gray-500" />
          </>
        )}
      </div>
    );
  };

  const contentMap = {
    "application/epub+zip": renderEpub(),
    "video/": <video src={inModal ? urlInfo.fullUrl : undefined} controls={inModal} {...commonProps} />,
    "image/": (
      <img 
        src={content?.imageObjectUrl || urlInfo.thumbnailUrl || urlInfo.fullUrl} 
        alt="Content" 
        decoding="async"
        {...commonProps} 
        crossOrigin="anonymous" 
      />
    ),
    "application/pdf": (
      <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
        <FaFilePdf className="text-gray-500 text-4xl absolute" />
        {inModal && <embed src={`${urlInfo.fullUrl}#view=FitH&page=1`} type="application/pdf" {...commonProps} />}
      </div>
    ),
  };

  const renderedContent = Object.entries(contentMap).find(([key]) => contentType.startsWith(key))?.[1] || (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      {getFileIcon(contentType)}
    </div>
  );

  return (
    <div className={`relative ${inModal ? 'w-full h-full' : 'w-full h-full'}`}>
      <ContentValidator
        transactionId={transaction.id}
        contentUrl={content.url || ''}
        contentType={contentType}
        imageObjectUrl={content.imageObjectUrl || ''}
      />
      {renderedContent}
      {(showStats || !isMintable) && predictions && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-2 z-20">
          <p className="text-lg font-bold mb-2">Content Classification</p>
          <ul className="text-sm">
            {Object.entries(predictions).map(([key, value]) => (
              <li key={key}>{key}: {(value * 100).toFixed(2)}%</li>
            ))}
          </ul>
          {!isMintable && <p className="mt-2 text-red-400">This content is not mintable.</p>}
        </div>
      )}
    </div>
  );
};

export default ContentRenderer;
