import React from 'react';
import { File } from 'lucide-react';
import ContentValidator from './ContentValidator';
import SandboxRenderer from './SandboxRenderer';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo } from './types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const getContentType = (transaction: Transaction): string => {
  return transaction.tags.find(tag => tag.name === "Content-Type")?.value || 'application/octet-stream';
};

interface ContentRendererProps {
  transaction: Transaction;
  content: any;
  inModal?: boolean;
  contentUrls: ContentUrlInfo;
  handleRenderError: (id: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  transaction,
  content,
  inModal = false,
  contentUrls,
  handleRenderError,
}) => {
  const contentType = getContentType(transaction);
  const predictions = useSelector((state: RootState) => state.arweave.predictions[transaction.id]);
  const shouldShowBlur = predictions && predictions.isPorn === true;

  // If no content, show skeleton-like UI
  if (!content) {
    return (
      <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center gap-4">
        <File className="text-gray-500 dark:text-gray-400 text-4xl" />
        <div className="h-2 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`relative ${inModal ? 'w-full h-full' : 'w-full h-full'}`}>
      <ContentValidator
        transactionId={transaction.id}
        contentUrl={content.url || ''}
        contentType={contentType}
        imageObjectUrl={content.imageObjectUrl || ''}
      />
      <SandboxRenderer
        transaction={transaction}
        content={content}
        inModal={inModal}
        contentUrls={contentUrls}
        handleRenderError={handleRenderError}
      />
      {shouldShowBlur && (
        <div className="absolute inset-0 backdrop-blur-xl bg-black/30 z-[15]">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-medium">
            Content Filtered
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ContentRenderer);