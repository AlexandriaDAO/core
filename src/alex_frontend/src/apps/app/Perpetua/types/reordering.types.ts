import { ShelfPublic, Item } from "@/../../declarations/perpetua/perpetua.did";
import React from 'react';

/**
 * Core reordering types for the Perpetua app
 */

/**
 * Common interface for reorderable items
 */
export interface ReorderableItem {
  id: number | string;
}

/**
 * Parameters for reorder action
 */
export interface ReorderParams {
  shelfId: string;
  referenceItemId?: string | number | null;
  before?: boolean;
  orderedItemIds?: number[];
  principal: string;
  newItemOrder?: (string | number)[];
}

/**
 * Props for useItemReordering hook
 */
export interface UseItemReorderingProps {
  shelf: ShelfPublic;
  items: [number, Item][];
  hasEditAccess: boolean;
}

/**
 * Props for useShelfReordering hook
 */
export interface UseShelfReorderingProps {
  shelves: ShelfPublic[];
  hasEditAccess: boolean;
}

/**
 * Props for ItemReorderManager component
 */
export interface ItemReorderManagerProps {
  shelf: ShelfPublic;
  orderedItems: [number, Item][];
  isOwner: boolean;
  children: (props: ReorderRenderProps) => React.ReactNode;
}

/**
 * Props passed to render function
 */
export interface ReorderRenderProps {
  isEditMode: boolean;
  editedItems: [number, Item][];
  enterEditMode: () => void;
  cancelEditMode: () => void;
  saveItemOrder: () => Promise<void>;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  getDragItemStyle?: (index: number) => React.CSSProperties;
  draggedIndex?: number | null;
} 