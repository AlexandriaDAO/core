import React, { useState, useEffect } from 'react';
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { Badge } from "@/lib/components/badge";
import { Item } from "@/../../declarations/perpetua/perpetua.did";
import NftDisplay from './NftDisplay';
import { ShelfContentDisplay, MarkdownContentDisplay } from './ContentDisplays';
import { isNftContent, isShelfContent, isMarkdownContent } from "../../../utils";
import { RemoveItemButton } from '@/apps/app/Perpetua/features/shelf-management/components/RemoveItemButton';

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
  // Add state to track if card asset is loaded
  const [cardAssetLoaded, setCardAssetLoaded] = useState(false);
  
  // Simulate asset loading with useEffect
  useEffect(() => {
    // Wait for a short time to simulate assets loading
    const timer = setTimeout(() => {
      setCardAssetLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Render card with appropriate draggable properties when in edit mode
  const renderCard = (content: React.ReactNode) => (
    <div 
      key={`item-${itemKey}`}
      className={`item-card relative ${isEditMode ? 'cursor-grab active:cursor-grabbing transition-all duration-150' : ''}`}
      draggable={isEditMode}
      onDragStart={isEditMode ? (e) => handleDragStart(e, index) : undefined}
      onDragOver={isEditMode ? (e) => handleDragOver(e, index) : undefined}
      onDragEnd={isEditMode ? handleDragEnd : undefined}
      onDrop={isEditMode ? (e) => {
        console.log(`[ShelfContentCard] onDrop triggered. Passing index: ${index} to handleDrop prop.`);
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
            {/* Shadow */}
            <div className="absolute top-0.5 left-0 h-6 w-6 bg-black/30 rounded-b-sm blur-[1px]"></div>
            
            {/* Background */}
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

  // Render NFT content
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
  
  // Render shelf content
  if (isShelfContent(item.content)) {
    return renderCard(
      <ShelfContentDisplay 
        shelfId={item.content.Shelf} 
        owner={shelf.owner.toString()}
        onClick={() => handleContentClick(itemKey)}
        parentShelfId={shelf.shelf_id}
        itemId={itemKey}
        currentShelfId={shelf.shelf_id}
      />
    );
  }
  
  // Render markdown content
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
  
  // Fallback for unknown content
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
            Unknown
          </Badge>
        </div>
      }
    >
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center text-muted-foreground">Unknown content</div>
      </div>
    </ContentCard>
  );
};

export default ShelfContentCard; 