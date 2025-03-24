import React, { useState } from 'react';
import { Shelf, Slot } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { reorderSlot as reorderSlotAction } from "@/apps/Modules/shared/state/perpetua/perpetuaThunks";
import { useIdentity } from "@/hooks/useIdentity";

interface SlotReorderManagerProps {
  shelf: Shelf;
  orderedSlots: [number, Slot][];
  hasEditAccess: boolean;
  children: (props: {
    isEditMode: boolean;
    editedSlots: [number, Slot][];
    enterEditMode: () => void;
    cancelEditMode: () => void;
    saveSlotOrder: () => Promise<void>;
    handleDragStart: (index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;
    handleDrop: (e: React.DragEvent, index: number) => void;
  }) => React.ReactNode;
}

export const SlotReorderManager: React.FC<SlotReorderManagerProps> = ({
  shelf,
  orderedSlots,
  hasEditAccess,
  children
}) => {
  const dispatch = useAppDispatch();
  const identity = useIdentity();
  
  // State for managing edit mode and drag-and-drop
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedSlots, setEditedSlots] = useState<[number, Slot][]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  
  // Enter edit mode
  const enterEditMode = () => {
    setEditedSlots([...orderedSlots]);
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

  // Add drop handler for reordering slots
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    // Only proceed if both items are defined
    if (draggedItem !== null && dragOverItem !== null && draggedItem !== dragOverItem) {
      // Create a copy of the edited slots array
      const newSlots = [...editedSlots];
      
      // Remove the dragged item
      const draggedItemContent = newSlots.splice(draggedItem, 1)[0];
      
      // Insert at the new position
      newSlots.splice(dragOverItem, 0, draggedItemContent);
      
      // Update state with the new order
      setEditedSlots(newSlots);
      
      // Reset drag items
      setDraggedItem(null);
      setDragOverItem(null);
    }
  };
  
  // Handler for saving the edited slots order
  const saveSlotOrder = async () => {
    if (!isEditMode || !identity || !hasEditAccess) return;
    
    // Check if identity.identity exists before accessing it
    if (identity.identity) {
      const principal = identity.identity.getPrincipal().toString();
      
      try {
        // Get original order to compare with
        const originalOrderMap = new Map();
        orderedSlots.forEach(([id], index) => {
          originalOrderMap.set(id, index);
        });
        
        // Find the differences and apply each move
        // We need to reorder one slot at a time using the backend API
        for (let newIndex = 0; newIndex < editedSlots.length; newIndex++) {
          const [slotId] = editedSlots[newIndex];
          const oldIndex = originalOrderMap.get(slotId);
          
          // If position has changed
          if (oldIndex !== newIndex) {
            // Find the reference slot (the one we'll place this slot before or after)
            let referenceSlotId: number | null = null;
            let before = false;
            
            if (newIndex === 0) {
              // If moving to the first position, place before the current first item
              if (editedSlots.length > 1) {
                const [firstSlotId] = editedSlots[1];
                referenceSlotId = firstSlotId;
                before = true;
              }
            } else {
              // Otherwise, place after the previous item
              const [prevSlotId] = editedSlots[newIndex - 1];
              referenceSlotId = prevSlotId;
              before = false;
            }
            
            // Call the reorderSlot action
            await dispatch(reorderSlotAction({
              shelfId: shelf.shelf_id,
              slotId,
              referenceSlotId,
              before,
              principal
            }));
          }
        }
        
        // Exit edit mode after successful updates
        setIsEditMode(false);
      } catch (error) {
        console.error("Failed to save slot order:", error);
        // Could add error notification here
      }
    }
  };

  return children({
    isEditMode,
    editedSlots,
    enterEditMode,
    cancelEditMode,
    saveSlotOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop
  });
};

export default SlotReorderManager; 