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
  addSlot as addSlotAction,
  reorderSlot as reorderSlotAction,
  updateShelfMetadata
} from "@/apps/Modules/shared/state/perpetua/perpetuaThunks";
import { createFindSlotById } from "../../../utils";
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

  const addSlot = useCallback(async (shelf: Shelf, content: string, type: "Nft" | "Markdown" | "Shelf", referenceSlotId?: number | null, before?: boolean): Promise<void> => {
    if (!identity) return;
    await dispatch(addSlotAction({ 
      shelf, 
      content, 
      type,
      principal: identity.getPrincipal(),
      referenceSlotId,
      before
    }));
  }, [identity, dispatch]);

  const reorderSlot = useCallback(async (shelfId: string, slotId: number, referenceSlotId: number | null, before: boolean): Promise<void> => {
    if (!identity) return;
    await dispatch(reorderSlotAction({ 
      shelfId, 
      slotId, 
      referenceSlotId, 
      before,
      principal: identity.getPrincipal()
    }));
  }, [identity, dispatch]);

  // Helper function to find a slot by ID across all shelves
  const findSlotById = createFindSlotById(shelves);

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
    addSlot,
    reorderSlot,
    findSlotById,
    updateMetadata,
  };
}; 