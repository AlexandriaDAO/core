import { useCallback, useEffect } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
  selectUserShelves,
  selectLoading,
  selectError
} from "@/apps/app/Perpetua/state/perpetuaSlice";
import {
  loadShelves, 
  createShelf as createShelfAction, 
  addItem as addItemAction,
  setItemOrder as setItemOrderAction,
  reorderProfileShelf as reorderProfileShelfAction,
  updateShelfMetadata,
  createAndAddShelfItem as createAndAddShelfItemAction,
  removeItem as removeItemAction,
  getShelfById
} from "@/apps/app/Perpetua/state";
import { createFindItemById } from "../../../utils";
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";

// Custom hook for shelf operations
export const useShelfOperations = () => {
  const { identity } = useIdentity();
  const dispatch = useAppDispatch();
  const shelves = useAppSelector(selectUserShelves);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const loadShelvesData = useCallback(async () => {
    if (!identity) return;
    try {
      await dispatch(loadShelves({ 
        principal: identity.getPrincipal(), 
        params: { offset: 0, limit: 20 }
      })).unwrap();
    } catch (error) {
      console.error("Failed to load shelves:", error);
    }
  }, [identity, dispatch]);
  
  const createShelf = useCallback(async (title: string, description: string): Promise<string | null> => {
    if (!identity) return null;
    try {
      const result = await dispatch(createShelfAction({ 
        title, 
        description, 
        principal: identity.getPrincipal()
      })).unwrap();
      
      // Load the updated shelves
      await dispatch(loadShelves({ 
        principal: identity.getPrincipal(), 
        params: { offset: 0, limit: 20 }
      })).unwrap();
      
      return result.shelfId || null;
    } catch (error) {
      console.error("Failed to create shelf:", error);
      return null;
    }
  }, [identity, dispatch]);

  const getShelf = useCallback(async (shelfId: string): Promise<ShelfPublic | null> => {
    try {
      const result = await dispatch(getShelfById(shelfId)).unwrap();
      return result || null;
    } catch (error) {
      console.error(`Failed to get shelf ${shelfId}:`, error);
      return null;
    }
  }, [dispatch]);

  const addItem = useCallback(async (
    shelf: ShelfPublic, 
    content: string, 
    type: "Nft" | "Markdown" | "Shelf", 
    collectionType?: "NFT" | "SBT",
    referenceItemId?: number | null, 
    before?: boolean
  ): Promise<void> => {
    if (!identity) throw new Error("User identity not found");
    try {
      await dispatch(addItemAction({ 
        shelf, 
        content, 
        type,
        collectionType,
        principal: identity.getPrincipal(),
        referenceItemId,
        before
      })).unwrap();
      
      // Get the updated shelf
      await getShelf(shelf.shelf_id);
      
    } catch (error) {
      console.error("Failed to add item:", error);
      // If there's an authentication error, log it specifically
      if (error && typeof error === 'string' && error.includes('Invalid principal')) {
        console.error("Authentication error: Invalid principal. User may need to log out and log back in.");
      }
      throw error;
    }
  }, [identity, dispatch, getShelf]);

  const createAndAddShelfItem = useCallback(async (parentShelfId: string, title: string, description: string): Promise<string | null> => {
    if (!identity) return null;
    try {
      const result = await dispatch(createAndAddShelfItemAction({
        parentShelfId,
        title,
        description,
        principal: identity.getPrincipal()
      })).unwrap();
      
      // Load the updated shelves and get the updated parent shelf
      await dispatch(loadShelves({ 
        principal: identity.getPrincipal(), 
        params: { offset: 0, limit: 20 }
      })).unwrap();
      await getShelf(parentShelfId);
      
      return result.newShelfId || null;
    } catch (error) {
      console.error("Failed to create and add shelf item:", error);
      return null;
    }
  }, [identity, dispatch, getShelf]);

  const setItemOrder = useCallback(async (shelfId: string, orderedItemIds: number[]): Promise<boolean> => {
    if (!identity) return false;
    try {
      await dispatch(setItemOrderAction({
        shelfId,
        orderedItemIds,
        principal: identity.getPrincipal()
      })).unwrap();

      // Get the updated shelf (optional, depends if you need the full shelf data immediately after reorder)
      await getShelf(shelfId);

      return true;
    } catch (error) {
      console.error("Failed to set item order:", error);
      return false;
    }
  }, [identity, dispatch, getShelf]);

  // New function to reorder shelves in a user's profile
  const reorderShelf = useCallback(async (shelfId: string, referenceShelfId: string | null, before: boolean): Promise<boolean> => {
    if (!identity) return false;
    try {
      await dispatch(reorderProfileShelfAction({
        shelfId,
        referenceShelfId,
        before,
        principal: identity.getPrincipal()
      })).unwrap();
      
      return true;
    } catch (error) {
      console.error("Failed to reorder shelf:", error);
      return false;
    }
  }, [identity, dispatch]);

  const removeItem = useCallback(async (shelfId: string, itemId: number): Promise<boolean> => {
    if (!identity) return false;
    try {
      await dispatch(removeItemAction({ 
        shelfId, 
        itemId,
        principal: identity.getPrincipal()
      })).unwrap();
      
      // Get the updated shelf
      await getShelf(shelfId);
      
      return true;
    } catch (error) {
      console.error("Failed to remove item:", error);
      return false;
    }
  }, [identity, dispatch, getShelf]);

  // Helper function to find a item by ID across all shelves
  const findItemById = createFindItemById(shelves);

  const updateMetadata = useCallback(async (shelfId: string, title?: string, description?: string): Promise<boolean> => {
    try {
      await dispatch(updateShelfMetadata({ shelfId, title, description })).unwrap();
      
      // Get the updated shelf
      await getShelf(shelfId);
      
      return true;
    } catch (error) {
      console.error("Failed to update shelf metadata:", error);
      return false;
    }
  }, [dispatch, getShelf]);

  return {
    shelves,
    loading,
    error,
    createShelf,
    addItem,
    createAndAddShelfItem,
    setItemOrder,
    reorderShelf,
    findItemById,
    updateMetadata,
    removeItem,
    getShelf,
  };
}; 