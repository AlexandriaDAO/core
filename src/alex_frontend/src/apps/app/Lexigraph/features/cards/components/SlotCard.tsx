import React from 'react';
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { renderSlotContent, isNftContent } from "../../../utils";
import { SlotCardProps } from '../types/types';
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const SlotCard: React.FC<SlotCardProps> = ({ 
  slot, 
  slotId, 
  onClick = () => {}, 
  isEditMode = false,
  dragHandlers
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { nfts } = useSelector((state: RootState) => state.nftData);
  
  // Check if the slot contains an NFT and if it's owned by the current user
  const isOwned = React.useMemo(() => {
    if (isNftContent(slot.content)) {
      const nftId = slot.content.Nft;
      return user && nfts[nftId]?.principal === user.principal ? true : false;
    }
    return false;
  }, [slot, user, nfts]);

  const handleClick = () => {
    onClick();
  };

  return (
    <div 
      className="slot-card" 
      draggable={isEditMode}
      onDragStart={isEditMode && dragHandlers?.onDragStart ? () => dragHandlers.onDragStart?.() : undefined}
      onDragOver={isEditMode && dragHandlers?.onDragOver ? (e) => dragHandlers.onDragOver?.(e) : undefined}
      onDragEnd={isEditMode && dragHandlers?.onDragEnd ? () => dragHandlers.onDragEnd?.() : undefined}
      onDrop={isEditMode && dragHandlers?.onDrop ? (e) => dragHandlers.onDrop?.(e) : undefined}
    >
      <ContentCard
        onClick={handleClick}
        id={slotId.toString()}
        isOwned={isOwned}
        component="Lexigraph"
      >
        <div className="p-4 w-full h-full flex flex-col">
          {isEditMode && (
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Slot #{slotId}</div>
              <div 
                className="slot-drag-handle text-gray-400 p-1 rounded hover:bg-gray-100 cursor-grab"
                onMouseDown={(e) => {
                  // Prevent the click event on the parent div
                  e.stopPropagation();
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                </svg>
              </div>
            </div>
          )}
          {renderSlotContent(slot, slotId)}
        </div>
      </ContentCard>
    </div>
  );
}; 