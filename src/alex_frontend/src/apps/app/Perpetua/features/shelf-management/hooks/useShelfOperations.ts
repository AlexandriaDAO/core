import { useCallback, useEffect } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
  selectShelves,
  selectLoading
} from "@/apps/Modules/shared/state/perpetua/perpetuaSlice";
import {
  loadShelves, 
  createShelf as createShelfAction, 
  addItem as addItemAction,
  reorderItem as reorderItemAction,
  updateShelfMetadata,
  createAndAddShelfItem as createAndAddShelfItemAction,
  removeItem as removeItemAction
} from "@/apps/Modules/shared/state/perpetua/perpetuaThunks";
import { createFindItemById } from "../../../utils";
import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";

// Custom hook for shelf operations
export const useShelfOperations = () => {
  const { identity } = useIdentity();
  const dispatch = useAppDispatch();
  const shelves = useAppSelector(selectShelves);
  const loading = useAppSelector(selectLoading);

  const loadShelvesData = useCallback(async () => {
    if (!identity) return;
    dispatch(loadShelves(identity.getPrincipal()));
  }, [identity, dispatch]);

  const createShelf = useCallback(async (title: string, description: string): Promise<void> => {
    if (!identity) return;
    await dispatch(createShelfAction({ 
      title, 
      description, 
      principal: identity.getPrincipal()
    }));
  }, [identity, dispatch]);

  const addItem = useCallback(async (shelf: Shelf, content: string, type: "Nft" | "Markdown" | "Shelf", referenceItemId?: number | null, before?: boolean): Promise<void> => {
    if (!identity) return;
    await dispatch(addItemAction({ 
      shelf, 
      content, 
      type,
      principal: identity.getPrincipal(),
      referenceItemId,
      before
    }));
  }, [identity, dispatch]);

  const createAndAddShelfItem = useCallback(async (parentShelfId: string, title: string, description: string): Promise<string | null> => {
    if (!identity) return null;
    try {
      const result = await dispatch(createAndAddShelfItemAction({
        parentShelfId,
        title,
        description,
        principal: identity.getPrincipal()
      })).unwrap();
      
      return result.newShelfId || null;
    } catch (error) {
      console.error("Failed to create and add shelf item:", error);
      return null;
    }
  }, [identity, dispatch]);

  const reorderItem = useCallback(async (shelfId: string, itemId: number, referenceItemId: number | null, before: boolean): Promise<void> => {
    if (!identity) return;
    await dispatch(reorderItemAction({ 
      shelfId, 
      itemId, 
      referenceItemId, 
      before,
      principal: identity.getPrincipal()
    }));
  }, [identity, dispatch]);

  const removeItem = useCallback(async (shelfId: string, itemId: number): Promise<boolean> => {
    if (!identity) {
      console.error("Cannot remove item: No identity available");
      return false;
    }
    console.log(`Attempting to remove item ${itemId} from shelf ${shelfId}`);
    try {
      console.log("Dispatching removeItemAction with:", {
        shelfId, 
        itemId,
        principal: identity.getPrincipal().toString()
      });
      
      const result = await dispatch(removeItemAction({ 
        shelfId, 
        itemId,
        principal: identity.getPrincipal()
      })).unwrap();
      
      console.log("RemoveItem result:", result);
      return true;
    } catch (error) {
      console.error("Failed to remove item:", error);
      return false;
    }
  }, [identity, dispatch]);

  // Helper function to find a item by ID across all shelves
  const findItemById = createFindItemById(shelves);

  const updateMetadata = async (shelfId: string, title?: string, description?: string) => {
    try {
      await dispatch(updateShelfMetadata({ shelfId, title, description })).unwrap();
      return true;
    } catch (error) {
      console.error("Failed to update shelf metadata:", error);
      return false;
    }
  };

  useEffect(() => {
    if (identity) {
      loadShelvesData();
    }
  }, [identity, loadShelvesData]);

  return {
    shelves,
    loading,
    createShelf,
    addItem,
    createAndAddShelfItem,
    reorderItem,
    findItemById,
    updateMetadata,
    removeItem,
  };
}; 