import React from 'react';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo } from './types';
import { ContentTypeMap } from './ContentTypeMap';

interface SandboxRendererProps {
  transaction: Transaction;
  content: any;
  inModal?: boolean;
  contentUrls: ContentUrlInfo;
  showStats?: boolean;
  handleRenderError: (id: string) => void;
}

const SandboxRenderer: React.FC<SandboxRendererProps> = ({
  transaction,
  content,
  inModal = false,
  contentUrls,
  handleRenderError,
}) => {

  return (
    <ContentTypeMap
      transaction={transaction}
      content={content}
      inModal={inModal}
      contentUrls={contentUrls}
      handleRenderError={handleRenderError}
    />
  );
};

export default React.memo(SandboxRenderer);
