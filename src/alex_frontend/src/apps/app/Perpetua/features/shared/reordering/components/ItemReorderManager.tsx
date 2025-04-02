import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Shelf, Item } from "@/../../declarations/perpetua/perpetua.did";
import { useItemReordering } from '../hooks/useItemReordering';
import { ItemReorderManagerProps, ReorderRenderProps } from '../../../../types/reordering.types';

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