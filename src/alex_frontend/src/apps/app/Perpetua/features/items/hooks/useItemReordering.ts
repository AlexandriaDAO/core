import { useCallback } from 'react';
import { Shelf, Item } from "@/../../declarations/perpetua/perpetua.did";
import { reorderItem as reorderItemAction } from '@/apps/app/Perpetua/state/perpetuaThunks';
import { useReorderable } from '../../../features/shared/hooks/useReorderable';
import { Principal } from '@dfinity/principal';

interface UseItemReorderingProps {
  shelf: Shelf;
  items: [number, Item][];
  hasEditAccess: boolean;
}

interface ReorderableShelfItem {
  id: number;
  item: Item;
}

/**
 * Custom hook for item reordering within a shelf
 */
export const useItemReordering = ({ shelf, items, hasEditAccess }: UseItemReorderingProps) => {
  // Transform the items data structure to match our ReorderableItem interface
  const reorderableItems = items.map(([id, item]) => ({
    id,
    item
  }));
  
  // Create an adapter function to match the expected parameter structure
  const reorderActionAdapter = useCallback((params: {
    shelfId: string;
    itemId: number | string;
    referenceItemId: number | string | null;
    before: boolean;
    principal: string;
  }) => {
    return reorderItemAction({
      shelfId: params.shelfId,
      itemId: Number(params.itemId), // Ensure itemId is a number
      referenceItemId: params.referenceItemId !== null ? Number(params.referenceItemId) : null, // Ensure referenceItemId is a number or null
      before: params.before,
      principal: params.principal as string | Principal
    });
  }, []);
  
  // Use the generic reorderable hook
  const {
    isEditMode,
    editedItems,
    enterEditMode,
    cancelEditMode,
    saveOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    draggedIndex,
    dragOverIndex,
    getDragItemStyle
  } = useReorderable<ReorderableShelfItem>({
    items: reorderableItems,
    containerId: shelf.shelf_id,
    hasEditAccess,
    reorderAction: reorderActionAdapter
  });
  
  // Transform the edited items back to the expected format for the UI
  const transformedEditedItems = useCallback(() => {
    return editedItems.map(item => [item.id, item.item] as [number, Item]);
  }, [editedItems]);
  
  return {
    isEditMode,
    editedItems: transformedEditedItems(),
    enterEditMode,
    cancelEditMode,
    saveItemOrder: saveOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    draggedIndex,
    dragOverIndex,
    getDragItemStyle
  };
};

export default useItemReordering; 