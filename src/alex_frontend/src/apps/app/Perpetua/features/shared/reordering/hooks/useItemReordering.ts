import { useCallback, useMemo, useRef, useEffect } from 'react';
import { Shelf, Item } from "@/../../declarations/perpetua/perpetua.did";
import { setItemOrder } from '@/apps/app/Perpetua/state';
import { useReorderable } from './useReorderable';
import { compareArrays, createReorderReturn } from '../utils/reorderUtils';
import { createReorderAdapter } from '../utils/createReorderAdapter';
import { UseItemReorderingProps, ReorderRenderProps, ReorderParams } from '../../../../types/reordering.types';

// Type for setItemOrder action parameters (Matches the thunk payload)
interface SetItemOrderParams {
  shelfId: string;
  orderedItemIds: number[];
  principal: string;
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
  
  // Create adapter function for the new setItemOrder action
  const reorderAdapter = useCallback(
    createReorderAdapter<SetItemOrderParams>({
      actionCreator: setItemOrder,
      parseId: (id) => typeof id === 'string' ? parseInt(id, 10) : id,
      fieldMapping: {
        // Map ReorderParams fields to SetItemOrderParams fields
        orderedItemIds: 'orderedItemIds',
        // No need to map itemId, referenceItemId, before
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