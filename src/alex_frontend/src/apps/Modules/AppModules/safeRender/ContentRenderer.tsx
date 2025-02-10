import React from 'react';
import { File } from 'lucide-react';
import ContentValidator from './ContentValidator';
import SandboxRenderer from './SandboxRenderer';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo } from './types';

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
  const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";

  // If no content, show skeleton-like UI
  if (!content) {
    return (
      <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center gap-4">
        <File className="text-gray-500 text-4xl" />
        <div className="h-2 w-32 bg-gray-300 rounded animate-pulse" />
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
    </div>
  );
};

export default React.memo(ContentRenderer);