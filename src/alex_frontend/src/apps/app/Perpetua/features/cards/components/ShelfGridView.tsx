import React from 'react';
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { Item } from "@/../../declarations/perpetua/perpetua.did";
import ShelfContentCard from './ShelfContentCard';

interface ShelfGridViewProps {
  items: [number, Item][];
  isEditMode: boolean;
  draggedIndex: number | null;
  shelf: any;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  getDragItemStyle?: (index: number) => React.CSSProperties;
  handleNftDetails: (tokenId: string) => void;
  handleContentClick: (itemId: number) => void;
}

export const ShelfGridView: React.FC<ShelfGridViewProps> = ({
  items,
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
  return (
    <ContentGrid>
      {items.map(([itemKey, item]: [number, Item], index: number) => (
        <ShelfContentCard
          key={`grid-item-${itemKey}`}
          itemKey={itemKey}
          item={item}
          index={index}
          isEditMode={isEditMode}
          draggedIndex={draggedIndex}
          shelf={shelf}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDragEnd={handleDragEnd}
          handleDrop={handleDrop}
          getDragItemStyle={getDragItemStyle}
          handleNftDetails={handleNftDetails}
          handleContentClick={handleContentClick}
        />
      ))}
    </ContentGrid>
  );
};

export default ShelfGridView; 