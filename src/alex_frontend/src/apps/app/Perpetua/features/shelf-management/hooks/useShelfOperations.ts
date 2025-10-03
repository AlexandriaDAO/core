import { useCallback } from "react";
import { useIdentity } from "@/lib/ic-use-identity";
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
  removeItem as removeItemAction,
  getShelfById
} from "@/apps/app/Perpetua/state";
import { createFindItemById } from "../../../utils";
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";
import { AddItemResult } from "@/apps/app/Perpetua/state/thunks/itemThunks";
import { usePerpetua } from "@/hooks/actors";

// Custom hook for shelf operations
export const useShelfOperations = () => {
  const { identity } = useIdentity();
  const {actor} = usePerpetua();
  const dispatch = useAppDispatch();
  const shelves = useAppSelector(selectUserShelves);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const loadShelvesData = useCallback(async () => {
    if (!identity || !actor) return;
    try {
      await dispatch(loadShelves({ 
        actor,
        principal: identity.getPrincipal(), 
        params: { offset: 0, limit: 20 }
      })).unwrap();
    } catch (error) {
      console.error("Failed to load shelves:", error);
    }
  }, [identity, dispatch, actor]);
  
  const createShelf = useCallback(async (title: string, description: string): Promise<string | null> => {
    try {
      if (!identity) throw new Error("User identity not found");
      if (!actor) throw new Error("Actor not found");
      const result = await dispatch(createShelfAction({ 
        actor,
        title, 
        description, 
        principal: identity.getPrincipal()
      })).unwrap();
      
      return result.shelfId || null;
    } catch (error) {
      console.error("Failed to create shelf:", error);
      return null;
    }
  }, [identity, actor, dispatch]);

  const getShelf = useCallback(async (shelfId: string): Promise<ShelfPublic | null> => {
    try {
      if(!actor) throw new Error("Actor not found");
      const result = await dispatch(getShelfById({actor, shelfId})).unwrap();
      return result || null;
    } catch (error) {
      console.error(`Failed to get shelf ${shelfId}:`, error);
      return null;
    }
  }, [dispatch, actor]);

  const addItem = useCallback(async (
    shelf: ShelfPublic, 
    content: string, 
    type: "Nft" | "Markdown" | "Shelf", 
    collectionType?: "NFT" | "SBT",
    referenceItemId?: number | null, 
    before?: boolean
  ): Promise<AddItemResult> => {
    if (!identity) return { status: 'error', message: "User identity not found" };
    if (!actor) return { status: 'error', message: "Actor not found" };

    try {
      // Pass all parameters to the thunk and return the result directly
      const result = await dispatch(addItemAction({ 
        actor,
        shelf, 
        content, 
        type,
        collectionType,
        principal: identity.getPrincipal(),
        referenceItemId,
        before
      })).unwrap();
      
      // Get the updated shelf in the background (don't wait for it)
      getShelf(shelf.shelf_id).catch(err => 
        console.warn(`Background refresh of shelf ${shelf.shelf_id} failed:`, err)
      );
      
      // Return the result exactly as received from the thunk
      return result;
      
    } catch (error) {
      console.error("Failed to add item:", error);
      // If there's an authentication error, log it specifically
      if (error && typeof error === 'string' && error.includes('Invalid principal')) {
        console.error("Authentication error: Invalid principal. User may need to log out and log back in.");
        return { status: 'error', message: "Authentication error. You may need to log out and log back in." };
      }
      
      // Return a proper error result
      const message = error instanceof Error ? error.message : 
                      typeof error === 'string' ? error :
                      "Failed to add item to shelf";
                      
      return { status: 'error', message };
    }
  }, [identity, dispatch, getShelf]);

  const setItemOrder = useCallback(async (shelfId: string, orderedItemIds: number[]): Promise<boolean> => {
    if (!identity || !actor) return false;
    try {
      await dispatch(setItemOrderAction({
        actor,
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
  }, [identity, actor, dispatch, getShelf]);

  // New function to reorder shelves in a user's profile
  const reorderShelf = useCallback(async (shelfId: string, referenceShelfId: string | null, before: boolean): Promise<boolean> => {
    if (!identity || !actor) return false;
    try {
      await dispatch(reorderProfileShelfAction({
        actor,
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
  }, [identity, actor, dispatch]);

  const removeItem = useCallback(async (shelfId: string, itemId: number): Promise<boolean> => {
    if (!identity || !actor) return false;
    try {
      await dispatch(removeItemAction({ 
        actor,
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
  }, [identity,actor, dispatch, getShelf]);

  // Helper function to find a item by ID across all shelves
  const findItemById = createFindItemById(shelves);

  const updateMetadata = useCallback(async (shelfId: string, title?: string, description?: string): Promise<boolean> => {
    try {
      if(!actor) throw new Error("Actor Unavailable");
      await dispatch(updateShelfMetadata({ actor, shelfId, title, description })).unwrap();
      
      // Get the updated shelf
      await getShelf(shelfId);
      
      return true;
    } catch (error) {
      console.error("Failed to update shelf metadata:", error);
      return false;
    }
  }, [dispatch, getShelf, actor]);

  return {
    shelves,
    loading,
    error,
    createShelf,
    addItem,
    setItemOrder,
    reorderShelf,
    findItemById,
    updateMetadata,
    removeItem,
    getShelf,
  };
}; 