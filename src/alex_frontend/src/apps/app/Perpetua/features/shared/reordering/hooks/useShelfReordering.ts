import { useCallback, useMemo, useRef, useEffect } from 'react';
import { reorderProfileShelf } from '@/apps/app/Perpetua/state';
import { useReorderable } from './useReorderable';
import { createReorderReturn } from '../utils/reorderUtils';
import { createReorderAdapter } from '../utils/createReorderAdapter';
import { UseShelfReorderingProps } from '../../../../types/reordering.types';
import { usePerpetua } from '@/hooks/actors';

// Type for reorderProfileShelf action parameters
interface ShelfReorderParams {
  shelfId: string;
  referenceShelfId: string | null;
  before: boolean;
  principal: string;
  newShelfOrder?: string[];
}

/**
 * Custom hook for shelf reordering
 */
export const useShelfReordering = ({ shelves, hasEditAccess }: UseShelfReorderingProps) => {
  const {actor} = usePerpetua();
  // Keep a stable reference to shelves 
  const shelvesRef = useRef(shelves);
  
  // Update the reference when shelves change
  useEffect(() => {
    shelvesRef.current = shelves;
  }, [shelves]);
  
  // Transform shelves to format expected by useReorderable - memoized
  const reorderableShelves = useMemo(() => 
    shelves.map(shelf => ({ id: shelf.shelf_id, shelf })),
    [shelves]
  );
  
  // Create adapter function for reorder action using the factory
  const reorderAdapter = useCallback(
    createReorderAdapter<ShelfReorderParams>({
      actionCreator: (params) => {
        if(!actor) return;
        return reorderProfileShelf({actor, ...params})
      },
      fieldMapping: {
        // Map ReorderParams fields to ShelfReorderParams fields
        itemId: 'shelfId',
        referenceItemId: 'referenceShelfId',
        newItemOrder: 'newShelfOrder'
      }
    }),
    [actor]
  );
  
  // Use the generic reorderable hook
  const reorderableProps = useReorderable({
    items: reorderableShelves,
    containerId: 'profile',
    hasEditAccess,
    reorderAction: reorderAdapter
  });
  
  // Transform edited items back to expected format - memoized
  const transformedShelves = useMemo(() => 
    reorderableProps.editedItems.map(item => item.shelf),
    [reorderableProps.editedItems]
  );
  
  // Return with consistent naming using createReorderReturn like useItemReordering does
  return createReorderReturn(
    reorderableProps,
    transformedShelves,
    'saveShelfOrder'
  );
}; 