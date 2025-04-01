import { useCallback, useMemo, useRef, useEffect } from 'react';
import { Shelf } from "@/../../declarations/perpetua/perpetua.did";
import { reorderProfileShelf } from '@/apps/app/Perpetua/state';
import { useReorderable } from './useReorderable';
import { compareArrays, createReorderReturn } from '../utils/reorderUtils';
import { UseShelfReorderingProps, ReorderParams } from '../types/reorderTypes';

// Helper function to get essential properties for shelf comparison
const getShelfEssentials = (shelf: Shelf) => ({
  shelf_id: shelf.shelf_id,
  title: shelf.title
});

/**
 * Custom hook for shelf reordering
 */
export const useShelfReordering = ({ shelves, hasEditAccess }: UseShelfReorderingProps) => {
  // Keep a stable reference to shelves 
  const shelvesRef = useRef(shelves);
  
  // Memoize essential shelf data for efficient comparison
  const shelfEssentials = useMemo(() => 
    shelves.map(getShelfEssentials),
    [shelves]
  );
  
  // Memoize shelf IDs for dependency arrays
  const shelfIds = useMemo(() => 
    shelves.map(shelf => shelf.shelf_id),
    [shelves]
  );
  
  // Only update reference when shelves change significantly
  useEffect(() => {
    if (!compareArrays(
      shelvesRef.current, 
      shelves, 
      ['shelf_id', 'title']
    )) {
      shelvesRef.current = shelves;
    }
  }, [shelves, shelfEssentials]);
  
  // Transform shelves to format expected by useReorderable - memoized
  const reorderableShelves = useMemo(() => 
    shelvesRef.current.map(shelf => ({ id: shelf.shelf_id, shelf })),
    [shelvesRef.current, shelfIds]
  );
  
  // Create adapter function for reorder action - memoized
  const reorderAdapter = useCallback((params: ReorderParams) => {
    return reorderProfileShelf({
      shelfId: params.itemId as string,
      referenceShelfId: params.referenceItemId as string | null,
      before: params.before,
      principal: params.principal,
      newShelfOrder: params.newItemOrder as string[] | undefined
    });
  }, []);
  
  // Use the generic reorderable hook
  const reorderableProps = useReorderable({
    items: reorderableShelves,
    containerId: 'profile',
    hasEditAccess,
    reorderAction: reorderAdapter
  });
  
  // Transform edited items back to expected format - memoized
  const transformedShelves = useMemo(() => {
    return reorderableProps.editedItems.map(item => item.shelf);
  }, [reorderableProps.editedItems]);
  
  // Return with consistent naming but using editedShelves instead of editedItems
  const result = useMemo(() => 
    createReorderReturn(
      reorderableProps,
      transformedShelves,
      'saveShelfOrder'
    ),
    [reorderableProps, transformedShelves]
  );
  
  return useMemo(() => ({
    ...result,
    editedShelves: result.editedItems 
  }), [result]);
}; 