import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useIdentity } from '@/hooks/useIdentity';
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
      console.error("Cannot save order: No identity available");
      return;
    }
    
    // Determine the new order - find the item that needs to move and its new position
    const originalIds = itemsRef.current.map(item => item.id);
    const newIds = editedItems.map(item => item.id);
    
    // Find the first position that changed
    let changedIndex = -1;
    for (let i = 0; i < newIds.length; i++) {
      if (newIds[i] !== originalIds[i]) {
        changedIndex = i;
        break;
      }
    }
    
    if (changedIndex === -1) {
      // No changes, just exit edit mode
      setIsEditMode(false);
      return;
    }
    
    // Determine the moved item ID
    const movedItemId = newIds[changedIndex];
    
    // Find where this ID was in the original order
    const originalPos = originalIds.indexOf(movedItemId);
    
    // If item moved earlier in the list, place before the item at the target position
    // If item moved later in the list, place after the item at the target position - 1
    const targetPos = changedIndex;
    const isMoveUp = targetPos < originalPos;
    
    // Get the reference item ID - MUST NOT be the same as the moved item
    let referenceId: string | number | null = null;
    let before = true;
    
    if (isMoveUp) {
      // For moving up, place before the item at target position
      if (targetPos < newIds.length) {
        const targetId = newIds[targetPos];
        // Avoid self-reference
        if (targetId === movedItemId) {
          // If we'd reference ourself, find another reference point
          if (targetPos + 1 < newIds.length) {
            // Use the next item as reference and place before it
            referenceId = newIds[targetPos + 1];
            before = true;
          } else if (targetPos > 0) {
            // Use the previous item as reference and place after it
            referenceId = newIds[targetPos - 1]; 
            before = false;
          } else {
            // Edge case: only one item
            referenceId = null;
            before = true;
          }
        } else {
          // Normal case
          referenceId = targetId;
          before = true;
        }
      } else {
        // Special case: target is last position
        referenceId = null;
        before = false;
      }
    } else {
      // For moving down, place after the item at target position - 1
      if (targetPos > 0) {
        const targetId = newIds[targetPos - 1];
        // Avoid self-reference
        if (targetId === movedItemId) {
          if (targetPos - 2 >= 0) {
            // Use the item before as reference
            referenceId = newIds[targetPos - 2];
            before = false;
          } else if (targetPos < newIds.length) {
            // Use the next item as reference
            referenceId = newIds[targetPos];
            before = true;
          } else {
            // Edge case
            referenceId = null;
            before = true;
          }
        } else {
          // Normal case
          referenceId = targetId;
          before = false;
        }
      } else {
        // Special case: target is first position
        if (newIds.length > 1) {
          // If multiple items, reference the second item
          referenceId = newIds[1];
          before = true;
        } else {
          // Edge case: only one item
          referenceId = null;
          before = true;
        }
      }
    }
    
    // Dispatch the reorder action with both specific parameters AND the complete new order
    try {
      await dispatch(reorderAction({
        shelfId: containerId,
        itemId: movedItemId,
        referenceItemId: referenceId,
        before,
        principal: identity.getPrincipal().toString(),
        newItemOrder: newIds
      })).unwrap();
      
      setIsEditMode(false);
    } catch (error) {
      // Revert to original order on error
      setEditedItems([...itemsRef.current]);
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