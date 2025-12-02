import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useIdentity } from '@/lib/ic-use-identity';
import { isEqual } from 'lodash';
import { useDragAndDrop } from './useDragAndDrop';
import { ReorderableItem, ReorderParams } from '../../../../types/reordering.types';

/**
 * Props for useReorderable hook
 * Used internally only 
 */
interface UseReorderableProps<T extends ReorderableItem> {
  // Items to be reordered
  items: T[];
  
  // ID of the container (e.g., shelf ID, category ID)
  containerId: string;
  
  // Whether the user has permission to edit/reorder items
  hasEditAccess: boolean;
  
  // Action creator for dispatching reorder operations
  reorderAction: (params: ReorderParams) => any;
}

/**
 * Generic hook for reordering items within a container (shelf, category, etc.)
 * Optimized to prevent unnecessary re-renders and calculations
 */
export const useReorderable = <T extends ReorderableItem>({
  items,
  containerId,
  hasEditAccess,
  reorderAction
}: UseReorderableProps<T>) => {
  const dispatch = useAppDispatch();
  const { identity } = useIdentity();
  
  // Maintain stable references to items
  const itemsRef = useRef(items);
  
  // Memoize item IDs for stable comparison
  const itemIds = useMemo(() => 
    items.map(item => item.id),
    [items]
  );
  
  // Update itemsRef reference tracking
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  
  // State management
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<T[]>([]);
  
  // Reset editedItems when original items change
  useEffect(() => {
    if (isEditMode) {
      setEditedItems([...itemsRef.current]);
    }
  }, [itemsRef.current, isEditMode]);
  
  // Handler for updating items after drag and drop
  const handleItemsReordered = useCallback((newItems: T[]) => {
    setEditedItems(newItems);
  }, []);
  
  // Use the drag and drop hook
  const dragDropProps = useDragAndDrop(editedItems, handleItemsReordered);
  
  // Edit mode functions
  const enterEditMode = useCallback(() => {
    setEditedItems([...itemsRef.current]);
    setIsEditMode(true);
  }, []);
  
  const cancelEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  // Save the reordered items
  const saveOrder = useCallback(async () => {
    if (!identity) {
      console.error("[useReorderable] Cannot save order: No identity available");
      return;
    }

    const originalIds = itemsRef.current.map(item => item.id);
    const newIds = editedItems.map(item => item.id);

    if (isEqual(originalIds, newIds)) {
      console.log("[useReorderable] No changes detected, exiting edit mode.");
      setIsEditMode(false);
      return;
    }

    // console.log(`[useReorderable] Saving absolute order. Shelf ID: ${containerId}, New IDs: [${newIds.join(', ')}]`);

    // Log the parameters being sent
    // console.log(`[useReorderable] Dispatching setItemOrder: shelfId=${containerId}, orderedItemIds=[${newIds.join(', ')}], principal=${identity.getPrincipal().toString()}`);

    // Dispatch the reorder action (which should now be setItemOrder)
    try {
      // Ensure newIds are numbers if your backend expects nat32/number[]
      const numericIds = newIds.map(id => {
        if (typeof id === 'number') return id;
        // Attempt conversion if needed, handle errors appropriately
        const num = Number(id);
        if (isNaN(num)) {
          throw new Error(`Invalid item ID found: ${id}`);
        }
        return num;
      });

      await dispatch(reorderAction({
        shelfId: containerId,
        orderedItemIds: numericIds, // Pass the full array of ordered IDs
        principal: identity.getPrincipal().toString(),
        // No need for itemId, referenceItemId, before, or newItemOrder here
        // as the thunk payload expects orderedItemIds
      })).unwrap();

      // console.log("[useReorderable] setItemOrder action dispatched successfully.");

      setIsEditMode(false);
    } catch (error) {
      // console.error("[useReorderable] setItemOrder action failed:", error);
      // Consider reverting editedItems on error:
      // setEditedItems([...itemsRef.current]);
    }
  }, [containerId, editedItems, identity, itemsRef, dispatch, reorderAction]);

  return {
    isEditMode,
    editedItems,
    enterEditMode,
    cancelEditMode,
    saveOrder,
    ...dragDropProps
  };
}; 