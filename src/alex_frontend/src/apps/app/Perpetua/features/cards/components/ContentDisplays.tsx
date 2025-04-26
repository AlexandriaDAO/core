import React from 'react';
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { Badge } from "@/lib/components/badge";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Principal } from '@dfinity/principal';

type ContentDisplayProps = {
  owner: string;
  onClick: () => void;
  parentShelfId?: string;
  itemId?: number;
  currentShelfId?: string;
};

// Display component for blog view markdown
export const BlogMarkdownDisplay = ({ content, onClick }: { content: string, onClick: () => void }) => (
  <div className="blog-markdown-content cursor-pointer font-serif" onClick={onClick}>
    <MarkdownRenderer content={content} />
  </div>
);

// Display component for shelf content
export const ShelfContentDisplay = ({
  shelfId,
  owner,
  onClick,
  parentShelfId,
  itemId,
  currentShelfId
}: ContentDisplayProps & { shelfId: string }) => (
  <ContentCard
    id={`shelf-${shelfId}`}
    onClick={onClick}
    owner={owner}
    component="Perpetua"
    parentShelfId={parentShelfId}
    itemId={itemId}
    currentShelfId={currentShelfId}
    footer={
      <div className="flex flex-wrap items-center gap-1 font-serif">
        <Badge variant="secondary" className="text-[10px] py-0.5 px-1">Shelf</Badge>
        <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">{shelfId}</Badge>
      </div>
    }
  >
    <div className="relative w-full h-full">
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-lg font-semibold font-serif">Shelf</div>
          <div className="text-sm text-gray-500 font-serif">{shelfId}</div>
        </div>
      </div>
    </div>
  </ContentCard>
);

// Display component for markdown content
export const MarkdownContentDisplay = ({
  content,
  owner,
  onClick,
  parentShelfId,
  itemId,
  currentShelfId
}: ContentDisplayProps & { content: string }) => {
  const preview = content.length > 30 ? `${content.substring(0, 30)}...` : content;
  
  return (
    <ContentCard
      id={`markdown-${preview}`}
      onClick={onClick}
      owner={owner}
      component="Perpetua"
      parentShelfId={parentShelfId}
      itemId={itemId}
      currentShelfId={currentShelfId}
      footer={
        <div className="flex flex-wrap items-center gap-1 font-serif">
          <Badge variant="outline" className="text-[10px] py-0.5 px-1">Markdown</Badge>
          <Badge variant="outline" className="text-[10px] py-0.5 px-1 max-w-[150px] truncate">{preview}</Badge>
        </div>
      }
    >
      <div className="relative w-full h-full">
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <div className="p-4 prose dark:prose-invert max-w-none line-clamp-6 font-serif">
            {content}
          </div>
        </div>
      </div>
    </ContentCard>
  );
}; 