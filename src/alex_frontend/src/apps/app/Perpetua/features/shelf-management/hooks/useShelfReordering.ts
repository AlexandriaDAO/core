import { useCallback, useEffect, useRef, useMemo } from 'react';
import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { useReorderable } from '../../../features/shared/hooks/useReorderable';
import { reorderProfileShelf as reorderProfileShelfAction } from '@/apps/app/Perpetua/state';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useIdentity } from '@/hooks/useIdentity';
import isEqual from 'lodash/isEqual';

interface UseShelfReorderingProps {
  shelves: Shelf[];
  hasEditAccess: boolean;
}

interface ReorderableShelf {
  id: string;
  shelf: Shelf;
}

// Helper to check if two arrays of shelves are deeply equal
const areShelvesDifferent = (prevShelves: Shelf[], nextShelves: Shelf[]): boolean => {
  if (prevShelves.length !== nextShelves.length) return true;
  
  // Check if ids, order, or content changed
  return !isEqual(
    prevShelves.map(s => ({ id: s.shelf_id, title: s.title })),
    nextShelves.map(s => ({ id: s.shelf_id, title: s.title }))
  );
};

/**
 * Custom hook for shelf reordering with optimizations to prevent unnecessary re-renders
 */
export const useShelfReordering = ({ shelves, hasEditAccess }: UseShelfReorderingProps) => {
  const dispatch = useAppDispatch();
  const { identity } = useIdentity();
  
  // Keep a stable reference to shelves to prevent unnecessary recalculations
  const shelvesRef = useRef(shelves);
  
  // Only update reference when shelves significantly change
  useEffect(() => {
    if (areShelvesDifferent(shelvesRef.current, shelves)) {
      shelvesRef.current = shelves;
    }
  }, [shelves]);

  // Memoize the transformation to prevent recreation on every render
  const reorderableShelves = useMemo(() => {
    return shelvesRef.current.map(shelf => ({
      id: shelf.shelf_id,
      shelf
    }));
  }, [shelvesRef.current]);
  
  // Get the owner principal from the first shelf (profile owner)
  // Memoize to maintain reference stability
  const ownerPrincipal = useMemo(() => {
    return shelvesRef.current.length > 0 
      ? shelvesRef.current[0].owner.toString() 
      : '';
  }, [shelvesRef.current]);
  
  // Create a stable adapter function with proper dependencies
  const reorderActionAdapter = useCallback((params: {
    shelfId: string;
    itemId: number | string;
    referenceItemId: number | string | null;
    before: boolean;
    principal: string;
  }) => {
    return reorderProfileShelfAction({
      shelfId: params.itemId as string,
      referenceShelfId: params.referenceItemId as string | null,
      before: params.before,
      principal: params.principal // Use the provided principal from params
    });
  }, []);
  
  // Use the generic reorderable hook with memoized values
  const reorderableProps = useReorderable<ReorderableShelf>({
    items: reorderableShelves,
    containerId: 'profile', // Use a fixed identifier for the profile shelves container
    hasEditAccess,
    reorderAction: reorderActionAdapter
  });
  
  // Transform the edited items back to Shelf[] format
  const transformedEditedShelves = useMemo(() => {
    return reorderableProps.editedItems.map(item => item.shelf);
  }, [reorderableProps.editedItems]);
  
  return {
    isEditMode: reorderableProps.isEditMode,
    editedShelves: transformedEditedShelves,
    enterEditMode: reorderableProps.enterEditMode,
    cancelEditMode: reorderableProps.cancelEditMode,
    saveShelfOrder: reorderableProps.saveOrder,
    handleDragStart: reorderableProps.handleDragStart,
    handleDragOver: reorderableProps.handleDragOver,
    handleDragEnd: reorderableProps.handleDragEnd,
    handleDrop: reorderableProps.handleDrop,
    draggedIndex: reorderableProps.draggedIndex,
    dragOverIndex: reorderableProps.dragOverIndex,
    getDragItemStyle: reorderableProps.getDragItemStyle
  };
}; 