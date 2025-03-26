import React, { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
  selectPublicShelves,
  selectPublicLoading,
  selectLastTimestamp,
  selectShelves,
  selectIsProfileReorderMode,
  selectProfileReorderLoading,
  selectUserPrincipal,
  enterProfileReorderMode,
  exitProfileReorderMode,
  setProfileReorderLoading,
  reorderShelvesLocal
} from "@/apps/Modules/shared/state/perpetua/perpetuaSlice";
import {
  loadRecentShelves,
  reorderProfileShelf,
  resetProfileOrder
} from "@/apps/Modules/shared/state/perpetua/perpetuaThunks";
import { createFindItemById } from "../../../utils";
import { useDragAndDropReordering } from "./useDragAndDropReordering";

// Custom hook for public shelf operations
export const usePublicShelfOperations = () => {
  const dispatch = useAppDispatch();
  const publicShelves = useAppSelector(selectPublicShelves);
  const loading = useAppSelector(selectPublicLoading);
  const lastTimestamp = useAppSelector(selectLastTimestamp);

  const loadRecentShelvesData = useCallback(async (limit: number = 20, beforeTimestamp?: string | bigint) => {
    await dispatch(loadRecentShelves({ limit, beforeTimestamp }));
  }, [dispatch]);

  const loadMoreShelves = useCallback(async () => {
    if (lastTimestamp && !loading) {
      // Convert lastTimestamp to appropriate format if needed
      await loadRecentShelvesData(20, lastTimestamp as string);
    }
  }, [lastTimestamp, loading, loadRecentShelvesData]);

  // Find a item by ID across all public shelves
  const findItemById = createFindItemById(publicShelves);

  // Only load public shelves once when the hook is first used
  const initialLoadRef = React.useRef(false);

  useEffect(() => {
    // Only load once if the public shelves array is empty and we're not already loading
    if (publicShelves.length === 0 && !loading && !initialLoadRef.current) {
      initialLoadRef.current = true;
      loadRecentShelvesData();
    }
  }, [publicShelves.length, loading, loadRecentShelvesData]);

  // Explicit refresh function - only call when needed
  const refreshPublicShelves = useCallback(() => {
    // Only refresh if not currently loading
    if (!loading) {
      loadRecentShelvesData();
    }
  }, [loading, loadRecentShelvesData]);

  return {
    publicShelves,
    loading,
    loadMoreShelves,
    findItemById,
    refreshPublicShelves
  };
};

export const useProfileShelfReordering = () => {
  const dispatch = useAppDispatch();
  const shelves = useAppSelector(selectShelves);
  const isReorderMode = useAppSelector(selectIsProfileReorderMode);
  const isLoading = useAppSelector(selectProfileReorderLoading);
  const userPrincipal = useAppSelector(selectUserPrincipal);

  // Handle local reordering
  const handleReorderShelves = useCallback((dragIndex: number, dropIndex: number) => {
    console.log(`Reordering shelves locally: ${dragIndex} -> ${dropIndex}`);
    dispatch(reorderShelvesLocal({ dragIndex, dropIndex }));
  }, [dispatch]);

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
  } = useDragAndDropReordering(handleReorderShelves);

  // Enter edit mode
  const enterReorderMode = useCallback(() => {
    dispatch(enterProfileReorderMode());
  }, [dispatch]);

  // Cancel edit mode and revert to original order
  const cancelReorderMode = useCallback(() => {
    dispatch(exitProfileReorderMode());
    resetDragState();
  }, [dispatch, resetDragState]);

  // Save the reordered shelves to the backend
  const saveShelfOrder = useCallback(async () => {
    if (!userPrincipal) return;
    
    dispatch(setProfileReorderLoading(true));
    
    try {
      // Get the original order to compare with
      const originalShelves = [...shelves];
      const originalOrderMap = new Map();
      originalShelves.forEach((shelf, index) => {
        originalOrderMap.set(shelf.shelf_id, index);
      });
      
      // Process changes one by one, similar to how ItemReorderManager works
      for (let newIndex = 0; newIndex < shelves.length; newIndex++) {
        const currentShelf = shelves[newIndex];
        const oldIndex = originalOrderMap.get(currentShelf.shelf_id);
        
        // Only process if the position has changed
        if (oldIndex !== newIndex) {
          console.log(`Shelf ${currentShelf.shelf_id} moved from position ${oldIndex} to ${newIndex}`);
          
          // Determine reference shelf and position (before/after)
          let referenceShelfId: string | undefined = undefined;
          let before = false;
          
          if (newIndex === 0) {
            // If moving to the first position, place before the current first shelf
            if (shelves.length > 1) {
              referenceShelfId = shelves[1].shelf_id;
              before = true;
            }
          } else {
            // Otherwise, place after the previous shelf
            referenceShelfId = shelves[newIndex - 1].shelf_id;
            before = false;
          }
          
          console.log(`Repositioning shelf ${currentShelf.shelf_id} ${before ? 'before' : 'after'} ${referenceShelfId || 'none'}`);
          
          // Call the backend API to reorder
          await dispatch(reorderProfileShelf({
            shelfId: currentShelf.shelf_id,
            referenceShelfId,
            before,
            principal: userPrincipal
          }));
          
          // Small delay to avoid race conditions
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Exit reorder mode after successful save
      dispatch(exitProfileReorderMode());
      resetDragState();
    } catch (error) {
      console.error("Failed to save shelf order:", error);
    } finally {
      dispatch(setProfileReorderLoading(false));
    }
  }, [dispatch, shelves, userPrincipal, resetDragState]);

  // Reset profile order to default (chronological)
  const handleResetProfileOrder = useCallback(async () => {
    if (!userPrincipal) return;
    
    dispatch(setProfileReorderLoading(true));
    
    try {
      await dispatch(resetProfileOrder(userPrincipal));
      // Exit reorder mode after successful reset
      dispatch(exitProfileReorderMode());
      resetDragState();
    } catch (error) {
      console.error("Failed to reset profile order:", error);
    } finally {
      dispatch(setProfileReorderLoading(false));
    }
  }, [dispatch, userPrincipal, resetDragState]);

  return {
    isReorderMode,
    isLoading,
    enterReorderMode,
    cancelReorderMode,
    saveShelfOrder,
    resetProfileOrder: handleResetProfileOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    draggedIndex,
    dragOverIndex,
    getDragItemStyle
  };
}; 