import { Shelf, Item } from "../../../../../../../../declarations/perpetua/perpetua.did";
import React from 'react';

// Shelf related props
export interface ShelfCardProps {
  shelf: Shelf;
  onViewShelf: (shelfId: string) => void;
  showOwner?: boolean;
}

export interface PublicShelfCardProps {
  shelf: Shelf;
  onViewShelf?: (shelfId: string) => void;
}

export interface ShelfDetailViewProps {
  shelf: Shelf;
  orderedItems: [number, Item][];
  isEditMode: boolean;
  editedItems: [number, Item][];
  hasEditAccess: boolean;
  onBack?: () => void;
  onAddItem?: (shelf: Shelf) => void;
  onViewItem?: (itemId: number) => void;
  onEnterEditMode: () => void;
  onCancelEditMode: () => void;
  onSaveItemOrder: () => Promise<void>;
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
  onViewShelf: (shelfId: string) => void;
  onViewOwner?: (ownerId: string) => void;
  onBack?: () => void;
  isReorderMode?: boolean;
  isCurrentUser?: boolean;
  onEnterReorderMode?: () => void;
  onCancelReorderMode?: () => void;
  onSaveReorderedShelves?: () => void;
  onResetProfileOrder?: () => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
} 