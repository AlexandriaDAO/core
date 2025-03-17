import { Shelf, Slot } from "../../../../../../../../declarations/lexigraph/lexigraph.did";
import React from 'react';

// Shelf related props
export interface ShelfCardProps {
  shelf: Shelf;
  onViewShelf: (shelfId: string) => void;
  showOwner?: boolean;
}

export interface PublicShelfCardProps {
  shelf: Shelf;
  onViewShelf: (shelfId: string) => void;
}

export interface ShelfDetailUIProps {
  shelf: Shelf;
  orderedSlots: [number, Slot][];
  isEditMode: boolean;
  editedSlots: [number, Slot][];
  hasEditAccess: boolean;
  onBack: () => void;
  onAddSlot?: (shelf: Shelf) => void;
  onViewSlot?: (slotId: number) => void;
  onEnterEditMode: () => void;
  onCancelEditMode: () => void;
  onSaveSlotOrder: () => Promise<void>;
  handleDragStart: (index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  settingsButton?: React.ReactNode;
}

export interface LibraryShelvesUIProps {
  shelves: Shelf[];
  loading: boolean;
  onNewShelf: () => void;
  onViewShelf: (shelfId: string) => void;
}

export interface ExploreShelvesUIProps {
  shelves: Shelf[];
  loading: boolean;
  onViewShelf: (shelfId: string) => void;
  onLoadMore: () => Promise<void>;
}

export interface UserShelvesUIProps {
  shelves: Shelf[];
  loading: boolean;
  onBack: () => void;
  onViewShelf: (shelfId: string) => void;
} 