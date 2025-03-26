import React from 'react';
import { Shelf, Item } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { useItemReordering } from '../hooks/useItemReordering';

interface ItemReorderManagerProps {
  shelf: Shelf;
  orderedItems: [number, Item][];
  hasEditAccess: boolean;
  children: (props: {
    isEditMode: boolean;
    editedItems: [number, Item][];
    enterEditMode: () => void;
    cancelEditMode: () => void;
    saveItemOrder: () => Promise<void>;
    handleDragStart: (index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;
    handleDrop: (e: React.DragEvent, index: number) => void;
    getDragItemStyle?: (index: number) => React.CSSProperties;
  }) => React.ReactNode;
}

export const ItemReorderManager: React.FC<ItemReorderManagerProps> = ({
  shelf,
  orderedItems,
  hasEditAccess,
  children
}) => {
  // Use our custom hook for all reordering logic
  const {
    isEditMode,
    editedItems,
    enterEditMode,
    cancelEditMode,
    saveItemOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    getDragItemStyle
  } = useItemReordering({
    shelf,
    items: orderedItems,
    hasEditAccess
  });

  return children({
    isEditMode,
    editedItems,
    enterEditMode,
    cancelEditMode,
    saveItemOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    getDragItemStyle
  });
};

export default ItemReorderManager; 