import { useCallback, useState } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useIdentity } from '@/hooks/useIdentity';
import { Shelf, Item } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { reorderItem as reorderItemAction } from '@/apps/Modules/shared/state/perpetua/perpetuaThunks';
import { useDragAndDropReordering } from '../../shelf-management/hooks/useDragAndDropReordering';

interface UseItemReorderingProps {
  shelf: Shelf;
  items: [number, Item][];
  hasEditAccess: boolean;
}

/**
 * Custom hook for item reordering within a shelf
 */
export const useItemReordering = ({ shelf, items, hasEditAccess }: UseItemReorderingProps) => {
  const dispatch = useAppDispatch();
  const { identity } = useIdentity();
  
  // Local state for items being edited
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<[number, Item][]>([]);
  
  // Enter edit mode
  const enterEditMode = useCallback(() => {
    setEditedItems([...items]);
    setIsEditMode(true);
  }, [items]);
  
  // Cancel edit mode
  const cancelEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);
  
  // Handle local reordering
  const handleReorderItems = useCallback((dragIndex: number, dropIndex: number) => {
    console.log(`Reordering items locally: ${dragIndex} -> ${dropIndex}`);
    
    // Create a copy of the edited items array
    const newItems = [...editedItems];
    
    // Remove the dragged item
    const draggedItemContent = newItems.splice(dragIndex, 1)[0];
    
    // Insert at the new position
    newItems.splice(dropIndex, 0, draggedItemContent);
    
    // Update state with the new order
    setEditedItems(newItems);
  }, [editedItems]);
  
  // Use the reusable drag-and-drop hook
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    getDragItemStyle,
    resetDragState
  } = useDragAndDropReordering(handleReorderItems);
  
  // Handler for saving the edited items order
  const saveItemOrder = useCallback(async () => {
    if (!isEditMode || !identity || !hasEditAccess) return;
    
    try {
      const principal = identity.getPrincipal().toString();
      
      // Get original order to compare with
      const originalOrderMap = new Map();
      items.forEach(([id], index) => {
        originalOrderMap.set(id, index);
      });
      
      // Find the differences and apply each move
      for (let newIndex = 0; newIndex < editedItems.length; newIndex++) {
        const [itemId] = editedItems[newIndex];
        const oldIndex = originalOrderMap.get(itemId);
        
        // If position has changed
        if (oldIndex !== newIndex) {
          // Determine reference item and position
          let referenceItemId: number | null = null;
          let before = false;
          
          if (newIndex === 0) {
            // If moving to the first position, place before the current first item
            if (editedItems.length > 1) {
              const [firstItemId] = editedItems[1];
              referenceItemId = firstItemId;
              before = true;
            }
          } else {
            // Otherwise, place after the previous item
            const [prevItemId] = editedItems[newIndex - 1];
            referenceItemId = prevItemId;
            before = false;
          }
          
          // Call the reorderItem action
          await dispatch(reorderItemAction({
            shelfId: shelf.shelf_id,
            itemId,
            referenceItemId,
            before,
            principal
          }));
        }
      }
      
      // Exit edit mode after successful updates
      setIsEditMode(false);
      resetDragState();
    } catch (error) {
      console.error("Failed to save item order:", error);
    }
  }, [isEditMode, identity, hasEditAccess, items, editedItems, shelf, dispatch, resetDragState]);
  
  return {
    isEditMode,
    editedItems,
    enterEditMode,
    cancelEditMode,
    saveItemOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    draggedIndex,
    dragOverIndex,
    getDragItemStyle
  };
};

export default useItemReordering; 