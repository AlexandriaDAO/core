import { useCallback, useMemo, useRef, useEffect } from 'react';
import { Shelf, Item } from "@/../../declarations/perpetua/perpetua.did";
import { reorderItem } from '@/apps/app/Perpetua/state';
import { useReorderable } from './useReorderable';
import { compareArrays, createReorderReturn } from '../utils/reorderUtils';
import { UseItemReorderingProps, ReorderParams } from '../types/reorderTypes';

/**
 * Custom hook for item reordering within a shelf
 */
export const useItemReordering = ({ shelf, items, hasEditAccess }: UseItemReorderingProps) => {
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
  
  // Create adapter function for reorder action
  const reorderAdapter = useCallback((params: ReorderParams) => {
    // Extract the numbers from the parameters
    const itemId = typeof params.itemId === 'string' ? parseInt(params.itemId as string, 10) : params.itemId as number;
    const referenceItemId = params.referenceItemId === null ? null :
      typeof params.referenceItemId === 'string' ? parseInt(params.referenceItemId as string, 10) : params.referenceItemId as number;
    
    // Map all item IDs to numbers for the optimistic update
    const newItemOrder = params.newItemOrder ? 
      params.newItemOrder.map(id => typeof id === 'string' ? parseInt(id as string, 10) : id as number) : 
      undefined;
    
    return reorderItem({
      shelfId: params.shelfId,
      itemId,
      referenceItemId,
      before: params.before,
      principal: params.principal,
      newItemOrder
    });
  }, []);
  
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