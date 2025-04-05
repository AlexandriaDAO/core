import { useCallback, useMemo, useRef, useEffect } from 'react';
import { Shelf, Item } from "@/../../declarations/perpetua/perpetua.did";
import { reorderItem } from '@/apps/app/Perpetua/state';
import { useReorderable } from './useReorderable';
import { compareArrays, createReorderReturn } from '../utils/reorderUtils';
import { createReorderAdapter } from '../utils/createReorderAdapter';
import { UseItemReorderingProps, ReorderRenderProps } from '../../../../types/reordering.types';

// Type for reorderItem action parameters
interface ItemReorderParams {
  shelfId: string;
  itemId: number;
  referenceItemId: number | null;
  before: boolean;
  principal: string;
  newItemOrder?: number[];
}

/**
 * Custom hook for item reordering within a shelf
 * Returns all necessary props for drag and drop reordering
 */
export const useItemReordering = ({ shelf, items, hasEditAccess }: UseItemReorderingProps): ReorderRenderProps => {
  // Keep a stable reference to items 
  const itemsRef = useRef(items);
  
  // Only update reference when items change significantly
  useEffect(() => {
    if (!compareArrays(
      itemsRef.current, 
      items, 
      ['0'] // Compare by ID (first element in tuple)
    )) {
      itemsRef.current = items;
    }
  }, [items]);
  
  // Transform items to format expected by useReorderable
  const reorderableItems = useMemo(() => 
    itemsRef.current.map(([id, item]) => ({ id, item })),
    [itemsRef.current]
  );
  
  // Create adapter function for reorder action using the factory
  const reorderAdapter = useCallback(
    createReorderAdapter<ItemReorderParams>({
      actionCreator: reorderItem,
      parseId: (id) => typeof id === 'string' ? parseInt(id, 10) : id,
      fieldMapping: {
        // Map ReorderParams fields to ItemReorderParams fields
        referenceItemId: 'referenceItemId',
        newItemOrder: 'newItemOrder'
      }
    }),
    []
  );
  
  // Use the generic reorderable hook
  const reorderableProps = useReorderable({
    items: reorderableItems,
    containerId: shelf.shelf_id,
    hasEditAccess,
    reorderAction: reorderAdapter
  });
  
  // Transform edited items back to expected tuple format
  const transformedItems = useMemo(() => 
    reorderableProps.editedItems.map(item => [item.id, item.item] as [number, Item]),
    [reorderableProps.editedItems]
  );
  
  // Return with consistent naming
  return createReorderReturn(
    reorderableProps,
    transformedItems,
    'saveItemOrder'
  );
};

export default useItemReordering; 