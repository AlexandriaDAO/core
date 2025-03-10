import React, { useState } from 'react';
import { Shelf, Slot } from "../../../../../declarations/lexigraph/lexigraph.did";
import { Button } from "@/lib/components/button";
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Edit, Plus, X } from "lucide-react";
import { convertTimestamp } from "@/utils/general";
import { renderBreadcrumbs, renderSlotContent, isShelfContent, SlotContentRenderer } from "./utils";

// Shelf Card Component for the library view
export const ShelfCard = ({ 
  shelf, 
  onViewShelf,
  showOwner = false 
}: {
  shelf: Shelf,
  onViewShelf: (shelfId: string) => void,
  showOwner?: boolean
}) => {
  const createdAt = convertTimestamp(shelf.created_at, 'combined');
  const updatedAt = convertTimestamp(shelf.updated_at, 'combined');
  const slotCount = Object.keys(shelf.slots).length;
  
  // Check if the updated_at is different from created_at (allowing a small buffer for processing time)
  const wasEdited = Number(shelf.updated_at) - Number(shelf.created_at) > 1000000; // 1 second buffer
  
  const handleViewUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to user's shelves
    window.location.href = `/lexigraph/user/${shelf.owner}`;
  };
  
  return (
    <ContentCard
      onClick={() => onViewShelf(shelf.shelf_id)}
      id={shelf.shelf_id}
      owner={showOwner ? shelf.owner.toString() : undefined}
      component="Lexigraph"
      footer={
        <div className="flex justify-between items-center w-full mt-2">
          <div className="text-xs text-muted-foreground">
            {slotCount} {slotCount === 1 ? 'item' : 'items'}
          </div>
        </div>
      }
    >
      <div className="p-4 w-full h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-2">{shelf.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{shelf.description}</p>
        <div className="text-xs text-muted-foreground mt-2">
          <div className="flex flex-col space-y-1">
            <span>Created {createdAt}</span>
            {wasEdited && <span>Updated {updatedAt}</span>}
            {showOwner && (
              <div>
                <span>By: </span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs text-blue-500 hover:text-blue-700"
                  onClick={handleViewUser}
                >
                  {shelf.owner.toString().slice(0, 8)}...
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ContentCard>
  );
};

// Public Shelf Card Component for the explore view
export const PublicShelfCard = ({ 
  shelf, 
  onViewShelf 
}: {
  shelf: Shelf,
  onViewShelf: (shelfId: string) => void
}) => {
  return (
    <ShelfCard
      shelf={shelf}
      onViewShelf={onViewShelf}
      showOwner={true}
    />
  );
};

// Slot Card Component for displaying slots in a shelf
export interface SlotCardProps {
  slot: Slot;
  slotId: number;
  onClick?: () => void;
  isEditMode?: boolean;
  dragHandlers?: {
    onDragStart?: () => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDragEnd?: () => void;
    onDrop?: (e: React.DragEvent) => void;
  };
}

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

// SlotDetail component for individual slot view
export interface SlotDetailProps {
  slot: Slot;
  shelf: Shelf;
  slotKey: number;
  onBack: () => void;
  onBackToShelf: (shelfId: string) => void;
}

export const SlotDetail = ({
  slot,
  shelf,
  slotKey,
  onBack,
  onBackToShelf
}: SlotDetailProps) => {
  const backButtonLabel = "Back";
  
  const breadcrumbItems = [
    { label: backButtonLabel, onClick: onBack },
    { label: shelf.title, onClick: () => onBackToShelf(shelf.shelf_id) },
    { label: `Slot ${slotKey}` }
  ];
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-6">
        <Button variant="outline" onClick={() => onBackToShelf(shelf.shelf_id)} className="self-start flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Shelf
        </Button>
        {renderBreadcrumbs(breadcrumbItems)}
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Slot {slotKey}</h2>
          <div className="text-sm text-muted-foreground">
            From shelf: <span className="font-medium">{shelf.title}</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <ContentCard
            id={slot.id.toString()}
            component="Lexigraph"
            onClick={() => {
              if (isShelfContent(slot.content)) {
                const shelfContent = slot.content;
                onBackToShelf(shelfContent.Shelf);
              }
            }}
          >
            <div className="p-4 w-full h-full overflow-auto">
              <SlotContentRenderer 
                slot={slot} 
                showFull={true}
                onBackToShelf={onBackToShelf}
              />
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  );
};

// ShelfDetailUI component for rendering shelf slots with optional edit mode
export interface ShelfDetailUIProps {
  shelf: Shelf;
  orderedSlots: [number, Slot][];
  isEditMode: boolean;
  editedSlots: [number, Slot][];
  isPublic: boolean;
  onBack: () => void;
  onAddSlot?: (shelf: Shelf) => void;
  onViewSlot: (slotId: number) => void;
  onEnterEditMode: () => void;
  onCancelEditMode: () => void;
  onSaveSlotOrder: () => Promise<void>;
  handleDragStart: (index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
}

export const ShelfDetailUI = ({
  shelf,
  orderedSlots,
  isEditMode,
  editedSlots,
  isPublic,
  onBack,
  onAddSlot,
  onViewSlot,
  onEnterEditMode,
  onCancelEditMode,
  onSaveSlotOrder,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop
}: ShelfDetailUIProps) => {
  const backButtonLabel = "Back";
  
  const breadcrumbItems = [
    { label: backButtonLabel, onClick: onBack },
    { label: shelf.title }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          {renderBreadcrumbs(breadcrumbItems)}
        </div>
        
        {/* Shelf header with title, description, and control buttons */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{shelf.title}</h1>
            <p className="text-muted-foreground mt-1">{shelf.description}</p>
          </div>
          <div className="flex gap-2">
            {!isPublic && !isEditMode && onAddSlot && (
              <Button onClick={() => onAddSlot(shelf)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            )}
            {!isPublic && !isEditMode && orderedSlots.length > 0 && (
              <Button variant="outline" onClick={onEnterEditMode}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Layout
              </Button>
            )}
          </div>
        </div>

        {/* Display the slots in a unified grid view with conditional edit features */}
        {orderedSlots.length === 0 ? (
          <div className="p-8 bg-secondary rounded-md text-center col-span-3">
            <p>This shelf doesn't have any slots yet.</p>
            {!isPublic && onAddSlot && (
              <Button onClick={() => onAddSlot(shelf)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Slot
              </Button>
            )}
          </div>
        ) : (
          <ContentGrid>
            {(isEditMode ? editedSlots : orderedSlots).map(([slotId, slot], index) => (
              <div 
                key={slotId} 
                className={`${
                  isEditMode && index === (isEditMode ? editedSlots.indexOf(editedSlots.find(([id]) => id === slotId) || [0, {}] as [number, Slot]) : -1) ? 'opacity-50' : ''
                } ${
                  isEditMode && index === (editedSlots.indexOf(editedSlots.find(([id]) => id === slotId) || [0, {}] as [number, Slot])) ? 'border-dashed border-2 border-primary' : ''
                }`}
              >
                <SlotCard
                  slot={slot}
                  slotId={slotId}
                  onClick={() => onViewSlot(slotId)}
                  isEditMode={isEditMode}
                  dragHandlers={{
                    onDragStart: () => handleDragStart(index),
                    onDragOver: (e) => handleDragOver(e, index),
                    onDragEnd: handleDragEnd,
                    onDrop: (e) => handleDrop(e, index)
                  }}
                />
              </div>
            ))}
          </ContentGrid>
        )}
        
        {/* Show edit controls for non-public shelves */}
        {!isPublic && orderedSlots.length > 0 && (
          <div className="mt-6 flex justify-end space-x-2">
            {isEditMode ? (
              <>
                <Button 
                  variant="outline"
                  onClick={onCancelEditMode}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={onSaveSlotOrder}
                >
                  Save Layout
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

// LibraryShelvesUI component for displaying a grid of shelves
export interface LibraryShelvesUIProps {
  shelves: Shelf[];
  loading: boolean;
  onNewShelf: () => void;
  onViewShelf: (shelfId: string) => void;
}

export const LibraryShelvesUI = ({
  shelves,
  loading,
  onNewShelf,
  onViewShelf
}: LibraryShelvesUIProps) => {
  return (
    <div>
      {loading ? (
        <div className="p-8 text-center">Loading your shelves...</div>
      ) : shelves.length === 0 ? (
        <div className="p-8 bg-secondary rounded-md text-center">
          <p className="mb-4">You don't have any shelves yet.</p>
          <Button onClick={onNewShelf}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Shelf
          </Button>
        </div>
      ) : (
        <ContentGrid>
          {shelves.map((shelf) => (
            <ShelfCard 
              key={shelf.shelf_id}
              shelf={shelf}
              onViewShelf={onViewShelf}
            />
          ))}
        </ContentGrid>
      )}
    </div>
  );
};

// ExploreShelvesUI component for displaying public shelves
export interface ExploreShelvesUIProps {
  shelves: Shelf[];
  loading: boolean;
  onViewShelf: (shelfId: string) => void;
  onLoadMore: () => Promise<void>;
}

export const ExploreShelvesUI = ({
  shelves,
  loading,
  onViewShelf,
  onLoadMore
}: ExploreShelvesUIProps) => {
  return (
    <div>
      {loading ? (
        <div className="p-8 text-center">Loading shelves...</div>
      ) : shelves.length === 0 ? (
        <div className="p-8 bg-secondary rounded-md text-center">
          <p>No public shelves available.</p>
        </div>
      ) : (
        <>
          <ContentGrid>
            {shelves.map((shelf) => (
              <ShelfCard 
                key={shelf.shelf_id}
                shelf={shelf}
                onViewShelf={onViewShelf}
                showOwner={true}
              />
            ))}
          </ContentGrid>
          
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={onLoadMore}>
              Load More
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// UserShelvesUI component for displaying a specific user's shelves
export interface UserShelvesUIProps {
  shelves: Shelf[];
  loading: boolean;
  onBack: () => void;
  onViewShelf: (shelfId: string) => void;
}

export const UserShelvesUI = ({
  shelves,
  loading,
  onBack,
  onViewShelf
}: UserShelvesUIProps) => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Button>
        <h1 className="text-2xl font-bold">User's Shelves</h1>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading shelves...</div>
      ) : shelves.length === 0 ? (
        <div className="p-8 bg-secondary rounded-md text-center">
          <p>This user has no public shelves.</p>
        </div>
      ) : (
        <ContentGrid>
          {shelves.map((shelf) => (
            <ShelfCard 
              key={shelf.shelf_id}
              shelf={shelf}
              onViewShelf={onViewShelf}
              showOwner={true}
            />
          ))}
        </ContentGrid>
      )}
    </div>
  );
}; 