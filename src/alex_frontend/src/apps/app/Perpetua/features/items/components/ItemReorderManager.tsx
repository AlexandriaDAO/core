import React, { useState } from 'react';
import { Shelf, Item } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { reorderItem as reorderItemAction } from "@/apps/Modules/shared/state/perpetua/perpetuaThunks";
import { useIdentity } from "@/hooks/useIdentity";

interface ItemReorderManagerProps {
  shelf: Shelf;
  orderedItems: [number, Item][];
  hasEditAccess: boolean;
  children: (props: {
    isEditMode: boolean;
    editedItems: [number, Item][];
    enterEditMode: () => void;
    cancelEditMode: () => void;
    saveItemOrder: () => Promise<void>;
    handleDragStart: (index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;
    handleDrop: (e: React.DragEvent, index: number) => void;
  }) => React.ReactNode;
}

export const ItemReorderManager: React.FC<ItemReorderManagerProps> = ({
  shelf,
  orderedItems,
  hasEditAccess,
  children
}) => {
  const dispatch = useAppDispatch();
  const identity = useIdentity();
  
  // State for managing edit mode and drag-and-drop
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<[number, Item][]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  
  // Enter edit mode
  const enterEditMode = () => {
    setEditedItems([...orderedItems]);
    setIsEditMode(true);
    setDraggedItem(null);
    setDragOverItem(null);
  };
  
  // Cancel edit mode
  const cancelEditMode = () => {
    setIsEditMode(false);
  };
  
  // Define handlers for drag operations
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Add drop handler for reordering items
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    // Only proceed if both items are defined
    if (draggedItem !== null && dragOverItem !== null && draggedItem !== dragOverItem) {
      // Create a copy of the edited items array
      const newItems = [...editedItems];
      
      // Remove the dragged item
      const draggedItemContent = newItems.splice(draggedItem, 1)[0];
      
      // Insert at the new position
      newItems.splice(dragOverItem, 0, draggedItemContent);
      
      // Update state with the new order
      setEditedItems(newItems);
      
      // Reset drag items
      setDraggedItem(null);
      setDragOverItem(null);
    }
  };
  
  // Handler for saving the edited items order
  const saveItemOrder = async () => {
    if (!isEditMode || !identity || !hasEditAccess) return;
    
    // Check if identity.identity exists before accessing it
    if (identity.identity) {
      const principal = identity.identity.getPrincipal().toString();
      
      try {
        // Get original order to compare with
        const originalOrderMap = new Map();
        orderedItems.forEach(([id], index) => {
          originalOrderMap.set(id, index);
        });
        
        // Find the differences and apply each move
        // We need to reorder one item at a time using the backend API
        for (let newIndex = 0; newIndex < editedItems.length; newIndex++) {
          const [itemId] = editedItems[newIndex];
          const oldIndex = originalOrderMap.get(itemId);
          
          // If position has changed
          if (oldIndex !== newIndex) {
            // Find the reference item (the one we'll place this item before or after)
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
      } catch (error) {
        console.error("Failed to save item order:", error);
        // Could add error notification here
      }
    }
  };

  return children({
    isEditMode,
    editedItems,
    enterEditMode,
    cancelEditMode,
    saveItemOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop
  });
};

export default ItemReorderManager; 