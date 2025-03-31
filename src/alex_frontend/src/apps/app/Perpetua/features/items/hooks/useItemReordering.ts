import { useCallback } from 'react';
import { Shelf, Item } from "@/../../declarations/perpetua/perpetua.did";
import { reorderItem as reorderItemAction } from '@/apps/app/Perpetua/state';
import { useReorderable } from '../../shared/hooks/useReorderable';
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
 * Acts as an adapter between the shelf items and the generic reorderable hook
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
      itemId: Number(params.itemId),
      referenceItemId: params.referenceItemId !== null ? Number(params.referenceItemId) : null,
      before: params.before,
      principal: params.principal as string | Principal
    });
  }, []);
  
  // Use the generic reorderable hook
  const reorderableProps = useReorderable<ReorderableShelfItem>({
    items: reorderableItems,
    containerId: shelf.shelf_id,
    hasEditAccess,
    reorderAction: reorderActionAdapter
  });
  
  // Transform the edited items back to the expected format for the UI
  const transformedEditedItems = reorderableProps.editedItems.map(
    item => [item.id, item.item] as [number, Item]
  );
  
  return {
    isEditMode: reorderableProps.isEditMode,
    editedItems: transformedEditedItems,
    enterEditMode: reorderableProps.enterEditMode,
    cancelEditMode: reorderableProps.cancelEditMode,
    saveItemOrder: reorderableProps.saveOrder,
    handleDragStart: reorderableProps.handleDragStart,
    handleDragOver: reorderableProps.handleDragOver,
    handleDragEnd: reorderableProps.handleDragEnd,
    handleDrop: reorderableProps.handleDrop,
    getDragItemStyle: reorderableProps.getDragItemStyle
  };
};

export default useItemReordering; 