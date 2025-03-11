import React from 'react';
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { renderSlotContent } from "../utils";
import { SlotCardProps } from './types';

export const SlotCard: React.FC<SlotCardProps> = ({ 
  slot, 
  slotId, 
  onClick, 
  isEditMode = false,
  dragHandlers
}) => {
  // Handle the onClick event based on edit mode
  const handleClick = () => {
    if (!isEditMode && onClick) {
      onClick();
    }
  };

  // We'll wrap the ContentCard in a div that handles the drag events
  return (
    <div 
      className={`relative ${isEditMode ? 'cursor-move' : 'cursor-pointer'}`}
      draggable={isEditMode}
      onDragStart={isEditMode ? dragHandlers?.onDragStart : undefined}
      onDragOver={isEditMode ? dragHandlers?.onDragOver : undefined}
      onDragEnd={isEditMode ? dragHandlers?.onDragEnd : undefined}
      onDrop={isEditMode ? dragHandlers?.onDrop : undefined}
    >
      <ContentCard
        onClick={handleClick}
        id={slotId.toString()}
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