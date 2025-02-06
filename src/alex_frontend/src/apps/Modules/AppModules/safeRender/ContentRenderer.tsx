import React from 'react';
import { File } from 'lucide-react';
import { Skeleton } from "@/lib/components/skeleton";
import ContentValidator from './ContentValidator';
import SandboxRenderer from './SandboxRenderer';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo, MintableState } from './types';

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

  // Handle loading state and errors
  if (!content) {
    return (
      <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center gap-4">
        <File className="text-gray-500 text-4xl" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  return (
    <div className={`relative ${inModal ? 'w-full h-full' : 'w-full h-full'}`}>
      {/* <ContentValidator
        transactionId={transaction.id}
        contentUrl={content?.url || ''}
        contentType={contentType}
        imageObjectUrl={content.imageObjectUrl || ''}
      />
      <SandboxRenderer
        transaction={transaction}
        content={content}
        inModal={inModal}
        contentUrls={contentUrls}
        showStats={showStats}
        mintableState={mintableState}
        handleRenderError={handleRenderError}
      />
    </div>
  );
};

export default React.memo(ContentRenderer);
