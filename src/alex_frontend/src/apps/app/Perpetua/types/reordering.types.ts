import { Shelf, Item } from "@/../../declarations/perpetua/perpetua.did";
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
  itemId: number | string;
  referenceItemId: number | string | null;
  before: boolean;
  principal: string;
  newItemOrder?: (number | string)[];
}

/**
 * Props for useItemReordering hook
 */
export interface UseItemReorderingProps {
  shelf: Shelf;
  items: [number, Item][];
  hasEditAccess: boolean;
}

/**
 * Props for useShelfReordering hook
 */
export interface UseShelfReorderingProps {
  shelves: Shelf[];
  hasEditAccess: boolean;
}

/**
 * Props for ItemReorderManager component
 */
export interface ItemReorderManagerProps {
  shelf: Shelf;
  orderedItems: [number, Item][];
  hasEditAccess: boolean;
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
} 