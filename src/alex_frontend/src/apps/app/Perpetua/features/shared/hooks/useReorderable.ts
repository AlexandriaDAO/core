import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useIdentity } from '@/hooks/useIdentity';
import { AsyncThunkAction, unwrapResult } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';

interface ReorderableItem {
  id: number | string;
  // Any other properties your items might have
}

// More generic ReorderParams interface
export interface ReorderParams {
  shelfId: string;
  itemId: number | string;
  referenceItemId: number | string | null;
  before: boolean;
  principal: string;
}

interface UseReorderableProps<T extends ReorderableItem> {
  items: T[];
  containerId: string;
  hasEditAccess: boolean;
  reorderAction: (params: ReorderParams) => AsyncThunkAction<any, any, any>;
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
  
  // Update items only when they significantly change
  useEffect(() => {
    if (!isEqual(
      itemsRef.current.map(item => ({ id: item.id })),
      items.map(item => ({ id: item.id }))
    )) {
      itemsRef.current = items;
    }
  }, [items]);
  
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
  
  // Drag and drop handlers - memoized to maintain stable references
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    
    // Create custom drag image
    const draggedElement = e.currentTarget as HTMLElement;
    
    // Create a clone of the element for the drag image
    const dragImage = draggedElement.cloneNode(true) as HTMLElement;
    dragImage.style.width = `${draggedElement.offsetWidth}px`;
    dragImage.style.height = `${draggedElement.offsetHeight}px`;
    dragImage.style.opacity = '0.8';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px'; // Position offscreen
    dragImage.style.backgroundColor = 'white';
    dragImage.style.border = '2px solid #4299e1';
    dragImage.style.borderRadius = '4px';
    dragImage.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    
    // Append to body temporarily
    document.body.appendChild(dragImage);
    
    // Set the custom drag image
    e.dataTransfer.setDragImage(dragImage, draggedElement.offsetWidth / 2, draggedElement.offsetHeight / 2);
    
    // Remove the element after drag starts
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      // Reorder locally
      const newItems = [...editedItems];
      const draggedItem = newItems.splice(draggedIndex, 1)[0];
      newItems.splice(dropIndex, 0, draggedItem);
      setEditedItems(newItems);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, editedItems]);
  
  // Style utility - memoized to prevent recreation on every render
  const getDragItemStyle = useCallback((index: number) => {
    if (draggedIndex === index) {
      return { 
        opacity: 0.5,
        transform: 'scale(0.98)',
        boxShadow: '0 0 0 2px #4299e1',
        transition: 'all 0.2s ease'
      };
    }
    
    if (dragOverIndex === index) {
      return { 
        borderTop: '2px dashed #4299e1',
        backgroundColor: 'rgba(66, 153, 225, 0.05)',
        transform: 'scale(1.02)',
        transition: 'all 0.2s ease'
      };
    }
    
    return {};
  }, [draggedIndex, dragOverIndex]);
  
  // Track operations to prevent duplicate API calls
  const operationsInProgress = useRef(new Set<string>());
  
  // Save the new order - memoize to keep stable reference
  const saveOrder = useCallback(async () => {
    if (!isEditMode || !identity || !hasEditAccess) return;
    
    try {
      const principal = identity.getPrincipal().toString();
      
      // Map original positions - use memoized reference
      const originalOrderMap = new Map();
      itemsRef.current.forEach((item, index) => {
        originalOrderMap.set(item.id, index);
      });
      
      // Apply each move
      for (let newIndex = 0; newIndex < editedItems.length; newIndex++) {
        const item = editedItems[newIndex];
        const oldIndex = originalOrderMap.get(item.id);
        
        if (oldIndex !== newIndex) {
          // Create a unique operation key to prevent duplicates
          const operationKey = `move-${item.id}-to-${newIndex}`;
          
          // Skip if this exact operation is already in progress
          if (operationsInProgress.current.has(operationKey)) {
            continue;
          }
          
          // Determine reference item and position
          let referenceItemId: number | string | null = null;
          let before = false;
          
          if (newIndex === 0) {
            // Moving to the first position
            if (editedItems.length > 1) {
              referenceItemId = editedItems[1].id;
              before = true;
            }
          } else {
            // Moving after another item
            referenceItemId = editedItems[newIndex - 1].id;
            before = false;
          }
          
          try {
            // Add this operation to the in-progress set
            operationsInProgress.current.add(operationKey);
            
            // Check which principal is being used - container ID (owner) or current user
            const finalPrincipal = containerId || principal;
            
            // Dispatch reorder action
            const resultAction = await dispatch(reorderAction({
              shelfId: containerId,
              itemId: item.id,
              referenceItemId,
              before,
              principal: finalPrincipal
            }));
            
            unwrapResult(resultAction);
            
            // Remove from in-progress set when done
            operationsInProgress.current.delete(operationKey);
          } catch (error) {
            // Remove from in-progress set on error
            operationsInProgress.current.delete(operationKey);
            
            if (error instanceof Error) {
              throw new Error(`Reordering failed: ${error.message}`);
            } else {
              throw new Error(`Reordering failed: ${String(error)}`);
            }
          }
        }
      }
      
      setIsEditMode(false);
    } catch (error) {
      throw error; // Re-throw the error so the caller can handle it
    }
  }, [isEditMode, identity, hasEditAccess, editedItems, containerId, dispatch, reorderAction]);
  
  // Return stable references by using useMemo for the returned object
  return useMemo(() => ({
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
  }), [
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
  ]);
};

export default useReorderable; 