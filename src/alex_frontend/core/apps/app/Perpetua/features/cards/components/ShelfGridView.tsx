import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { Item } from "@/../../declarations/perpetua/perpetua.did";
import ShelfContentCard from './ShelfContentCard';
import { fetchNftMetadataBatch } from '@/apps/app/Perpetua/state/thunks/nftThunks';
import { AppDispatch } from '@/store';

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
  const dispatch = useDispatch<AppDispatch>();
  const dispatchedTokenIdsRef = useRef<string>('');

  useEffect(() => {
    let currentTokenIdsString = '';

    if (items && items.length > 0) {
      const tokenIdsToFetch: string[] = [];
      items.forEach(([_, item]) => {
        if (item.content && 'Nft' in item.content) {
          const tokenId = item.content.Nft;
          if (typeof tokenId === 'string') {
            tokenIdsToFetch.push(tokenId);
          }
        }
      });

      if (tokenIdsToFetch.length > 0) {
        const uniqueTokenIds = Array.from(new Set(tokenIdsToFetch));
        currentTokenIdsString = JSON.stringify(uniqueTokenIds.sort());
        
        if (dispatchedTokenIdsRef.current !== currentTokenIdsString) {
          console.log('[ShelfGridView] Dispatching fetchNftMetadataBatch for unique tokenIds:', uniqueTokenIds);
          dispatch(fetchNftMetadataBatch({ tokenIds: uniqueTokenIds }));
          dispatchedTokenIdsRef.current = currentTokenIdsString;
        } else {
          // console.log('[ShelfGridView] Token IDs unchanged, skipping dispatch', uniqueTokenIds);
        }
      } else {
        if (dispatchedTokenIdsRef.current !== '') {
          dispatchedTokenIdsRef.current = '';
        }
      }
    } else {
      if (dispatchedTokenIdsRef.current !== '') {
        dispatchedTokenIdsRef.current = '';
      }
    }
  }, [items, dispatch]);

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