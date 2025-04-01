import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useIdentity } from '@/hooks/useIdentity';
import { isEqual } from 'lodash';
import { ReorderableItem, ReorderParams } from '../types/reorderTypes';

/**
 * Props for useReorderable hook
 */
export interface UseReorderableProps<T extends ReorderableItem> {
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
  
  // Update items only when they significantly change
  useEffect(() => {
    // Compare only the IDs for a lightweight comparison
    if (!isEqual(
      itemsRef.current.map(item => item.id),
      itemIds
    )) {
      itemsRef.current = items;
    }
  }, [items, itemIds]);
  
  // State management
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<T[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Reset editedItems when original items change
  useEffect(() => {
    if (isEditMode) {
      setEditedItems([...itemsRef.current]);
    }
  }, [itemsRef.current, isEditMode]);
  
  // Edit mode functions
  const enterEditMode = useCallback(() => {
    setEditedItems([...itemsRef.current]);
    setIsEditMode(true);
  }, []);
  
  const cancelEditMode = useCallback(() => {
    setIsEditMode(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Handle drag start - memoize the handler
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    if (!isEditMode) return;
    
    setDraggedIndex(index);
    
    // Create custom drag image for better UX
    const draggedElement = e.currentTarget as HTMLElement;
    
    const dragImage = draggedElement.cloneNode(true) as HTMLElement;
    dragImage.style.width = `${draggedElement.offsetWidth}px`;
    dragImage.style.height = `${draggedElement.offsetHeight}px`;
    dragImage.style.opacity = '0.8';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.backgroundColor = 'white';
    dragImage.style.border = '2px solid #4299e1';
    dragImage.style.borderRadius = '4px';
    dragImage.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(
      dragImage, 
      draggedElement.offsetWidth / 2, 
      draggedElement.offsetHeight / 2
    );
    
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }, [isEditMode]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!isEditMode) return;
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex, isEditMode]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isEditMode) return;
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [isEditMode]);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!isEditMode) return;
    
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }
    
    // Create new item order by moving the dragged item
    const updatedItems = [...editedItems];
    const [draggedItem] = updatedItems.splice(draggedIndex, 1);
    updatedItems.splice(index, 0, draggedItem);
    
    setEditedItems(updatedItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, editedItems, isEditMode]);

  // Determine visual style for dragged items
  const getDragItemStyle = useCallback((index: number) => {
    if (!isEditMode) return {};
    
    if (draggedIndex === index) {
      return { 
        opacity: 0.5,
        transform: 'scale(0.98)',
        boxShadow: '0 0 0 2px #4299e1',
      };
    }
    
    if (dragOverIndex === index) {
      return { 
        borderTop: '2px dashed #4299e1',
        backgroundColor: 'rgba(66, 153, 225, 0.05)',
        transform: 'scale(1.02)',
      };
    }
    
    return {};
  }, [draggedIndex, dragOverIndex, isEditMode]);

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
        newItemOrder: newIds // Pass the complete new order for optimistic updates
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
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    draggedIndex,
    dragOverIndex,
    getDragItemStyle
  };
}; 