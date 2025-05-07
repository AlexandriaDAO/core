import React, { useState, useEffect } from 'react';
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { Badge } from "@/lib/components/badge";
import { Item, ShelfPublic as ShelfPublicDID } from "@/../../declarations/perpetua/perpetua.did";
import NftDisplay from './NftDisplay';
import { MarkdownContentDisplay } from './ContentDisplays';
import { isNftContent, isShelfContent as isShelfContentType, isMarkdownContent } from "../../../utils";
import { RemoveItemButton } from '@/apps/app/Perpetua/features/shelf-management/components/RemoveItemButton';
import { ShelfCard } from './ShelfCard';

interface ShelfContentCardProps {
  itemKey: number;
  item: Item;
  index: number;
  isEditMode: boolean;
  draggedIndex: number | null;
  shelf: {
    shelf_id: string;
    owner: { toString: () => string };
  };
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  getDragItemStyle?: (index: number) => React.CSSProperties;
  handleNftDetails: (tokenId: string) => void;
  handleContentClick: (itemId: number) => void;
}

export const ShelfContentCard: React.FC<ShelfContentCardProps> = ({
  itemKey,
  item,
  index,
  isEditMode,
  draggedIndex,
  shelf,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  getDragItemStyle,
  handleNftDetails,
  handleContentClick
}) => {
  const [cardAssetLoaded, setCardAssetLoaded] = useState(true);

  const renderCard = (content: React.ReactNode) => (
    <div 
      key={`item-${itemKey}`}
      className={`item-card relative ${isEditMode ? 'cursor-grab active:cursor-grabbing transition-all duration-150' : ''}`}
      draggable={isEditMode}
      onDragStart={isEditMode ? (e) => handleDragStart(e, index) : undefined}
      onDragOver={isEditMode ? (e) => handleDragOver(e, index) : undefined}
      onDragEnd={isEditMode ? handleDragEnd : undefined}
      onDrop={isEditMode ? (e) => {
        e.stopPropagation();
        handleDrop(e, index);
      } : undefined}
      style={isEditMode && getDragItemStyle ? getDragItemStyle(index) : {}}
    >
      {isEditMode && (
        <div className="absolute top-0 left-0 right-0 z-40 bg-black/50 text-white p-1 text-xs flex items-center justify-between">
          <span>Item #{itemKey}</span>
          <div className="item-drag-handle p-1 rounded hover:bg-gray-700 cursor-grab ml-auto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
            </svg>
          </div>
        </div>
      )}
      {!isEditMode && cardAssetLoaded && (
        <div className="absolute top-0 left-7 z-10" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <div className="absolute top-0.5 left-0 h-6 w-6 bg-black/30 rounded-b-sm blur-[1px]"></div>
            <div className="relative h-6 w-6 bg-black/75 rounded-b-sm flex items-center justify-center pt-1">
              <RemoveItemButton 
                shelfId={shelf.shelf_id}
                itemId={itemKey}
                buttonSize="sm" 
                variant="ghost" 
              />
            </div>
          </div>
        </div>
      )}
      <div className={isEditMode && draggedIndex === index ? 'opacity-30' : ''}>
        {content}
      </div>
    </div>
  );

  if (isNftContent(item.content)) {
    return renderCard(
      <NftDisplay 
        tokenId={item.content.Nft} 
        onViewDetails={handleNftDetails}
        inShelf={true}
        parentShelfId={shelf.shelf_id}
        itemId={itemKey}
        currentShelfId={shelf.shelf_id}
      />
    );
  }
  
  if (isShelfContentType(item.content)) {
    const shelfContentData = item.content.Shelf;

    if (typeof shelfContentData === 'object' && shelfContentData !== null && 'shelf_id' in shelfContentData && !('isLoading' in shelfContentData)) {
      return renderCard(
        <ShelfCard 
          shelf={shelfContentData as ShelfPublicDID}
          parentShelfId={shelf.shelf_id}
          itemId={itemKey}
          onViewShelf={() => handleContentClick(itemKey)}
        />
      );
    }
    
    let loadingShelfId: string | undefined = undefined;
    if (typeof shelfContentData === 'string') {
      loadingShelfId = shelfContentData;
    } else if (typeof shelfContentData === 'object' && shelfContentData !== null && 'isLoading' in shelfContentData && typeof (shelfContentData as any).Shelf === 'string') {
      loadingShelfId = (shelfContentData as any).Shelf;
    }

    if (loadingShelfId) {
      return renderCard(
        <ContentCard
          id={`shelf-loading-${loadingShelfId}`}
          owner={shelf.owner.toString()}
          component="Perpetua"
          parentShelfId={shelf.shelf_id}
          itemId={itemKey}
          footer={
            <div className="flex flex-wrap items-center gap-1 font-serif">
              <Badge variant="secondary" className="text-[10px] py-0.5 px-1">Shelf</Badge>
              <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">Loading...</Badge>
            </div>
          }
          onClick={() => handleContentClick(itemKey)}
        >
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center text-muted-foreground p-2">
              <svg className="w-8 h-8 text-primary mx-auto mb-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v3m0 12v3m-9-9h3m12 0h3M5.636 5.636l2.122 2.122m8.486 8.486l2.122 2.122M5.636 18.364l2.122-2.122m8.486-8.486l2.122-2.122"></path></svg>
              Loading Shelf...
            </div>
          </div>
        </ContentCard>
      );
    }
  }
  
  if (isMarkdownContent(item.content)) {
    return renderCard(
      <MarkdownContentDisplay 
        content={item.content.Markdown} 
        owner={shelf.owner.toString()}
        onClick={() => handleContentClick(itemKey)}
        parentShelfId={shelf.shelf_id}
        itemId={itemKey}
        currentShelfId={shelf.shelf_id}
      />
    );
  }
  
  return renderCard(
    <ContentCard
      id={`unknown-${itemKey}`}
      onClick={() => handleContentClick(itemKey)}
      owner={shelf.owner.toString()}
      component="Perpetua"
      parentShelfId={shelf.shelf_id}
      itemId={itemKey}
      currentShelfId={shelf.shelf_id}
      footer={
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="secondary" className="text-[10px] py-0.5 px-1">
            Item
          </Badge>
        </div>
      }
    >
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center text-muted-foreground">Unable to display item</div>
      </div>
    </ContentCard>
  );
};

export default ShelfContentCard; 