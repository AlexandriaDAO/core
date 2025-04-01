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
  shelf: any; // Using 'any' temporarily, should be properly typed with Shelf
  items: [number, any][]; // Using 'any' temporarily, should be properly typed with Item
  hasEditAccess: boolean;
}

/**
 * Props for useShelfReordering hook
 */
export interface UseShelfReorderingProps {
  shelves: any[]; // Using 'any' temporarily, should be properly typed with Shelf
  hasEditAccess: boolean;
}

/**
 * Props for ItemReorderManager component
 */
export interface ItemReorderManagerProps {
  shelf: any; // Using 'any' temporarily, should be properly typed with Shelf
  orderedItems: [number, any][]; // Using 'any' temporarily, should be properly typed with Item
  hasEditAccess: boolean;
  children: (props: ReorderRenderProps) => React.ReactNode;
}

/**
 * Props passed to render function
 */
export interface ReorderRenderProps {
  isEditMode: boolean;
  editedItems: [number, any][]; // Using 'any' temporarily, should be properly typed with Item
  enterEditMode: () => void;
  cancelEditMode: () => void;
  saveItemOrder: () => Promise<void>;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  getDragItemStyle?: (index: number) => React.CSSProperties;
} 