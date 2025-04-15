import React, { useCallback, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
  selectPublicShelves,
  selectPublicLoading,
  selectLastTimestamp
} from "@/apps/app/Perpetua/state/perpetuaSlice";
import {
  loadRecentShelves
} from "@/apps/app/Perpetua/state";
import { createFindItemById } from "../../../utils";

// Custom hook for public shelf operations
export const usePublicShelfOperations = () => {
  const dispatch = useAppDispatch();
  const publicShelves = useAppSelector(selectPublicShelves);
  const loading = useAppSelector(selectPublicLoading);
  const lastTimestamp = useAppSelector(selectLastTimestamp);

  const loadRecentShelvesData = useCallback(async (limit: number = 20, beforeTimestamp?: string | bigint) => {
    await dispatch(loadRecentShelves({ limit, cursor: beforeTimestamp }));
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