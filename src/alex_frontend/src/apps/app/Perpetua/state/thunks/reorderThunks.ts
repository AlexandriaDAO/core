import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { cacheManager } from '../cache/ShelvesCache';
import { updateShelfOrder } from '../perpetuaSlice';
import { getShelfById, loadShelves, loadMissingShelves } from './queryThunks';
import { perpetuaService } from '../services/perpetuaService';
import { toPrincipal, extractErrorMessage } from '../../utils';

/**
 * Reorder an item within a shelf
 */
export const reorderItem = createAsyncThunk(
  'perpetua/reorderItem',
  async ({ 
    shelfId, 
    itemId, 
    referenceItemId, 
    before,
    principal
  }: { 
    shelfId: string, 
    itemId: number, 
    referenceItemId: number | null, 
    before: boolean,
    principal: Principal | string
  }, { dispatch, rejectWithValue }) => {
    try {
      const result = await perpetuaService.reorderShelfItem(
        shelfId,
        itemId,
        referenceItemId,
        before
      );
      
      if ("Ok" in result && result.Ok) {
        // Invalidate caches for this shelf
        cacheManager.invalidateForShelf(shelfId);
        
        // Fetch the updated shelf data
        dispatch(getShelfById(shelfId));
        
        return { shelfId, itemId, referenceItemId, before };
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to reorder item");
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to reorder item"));
    }
  }
);

/**
 * Reorder a shelf within the user profile
 */
export const reorderProfileShelf = createAsyncThunk(
  'perpetua/reorderProfileShelf',
  async ({ 
    shelfId, 
    referenceShelfId, 
    before,
    principal,
    newShelfOrder // Optional parameter for the complete new order
  }: { 
    shelfId: string, 
    referenceShelfId: string | null, 
    before: boolean,
    principal: Principal | string,
    newShelfOrder?: string[] // Optional complete order for optimistic updates
  }, { dispatch, rejectWithValue, getState }) => {
    try {
      // If we have the complete new order, update it optimistically in Redux
      if (newShelfOrder) {
        dispatch(updateShelfOrder(newShelfOrder));
      }
      
      const result = await perpetuaService.reorderProfileShelf(
        shelfId,
        referenceShelfId,
        before
      );
      
      if ("Ok" in result && result.Ok) {
        // Invalidate all relevant caches
        cacheManager.invalidateForPrincipal(principal);
        cacheManager.invalidateForShelf(shelfId);
        if (referenceShelfId) {
          cacheManager.invalidateForShelf(referenceShelfId);
        }
        
        // Convert principal for API if needed
        const principalForApi = toPrincipal(principal);
        
        // Instead of force-reloading shelves which would overwrite our custom order,
        // just make sure any newly created shelves are loaded
        // We've already updated the order optimistically
        const state = getState() as any;
        const currentOrder = state?.perpetua?.ids?.userShelves || [];
        if (currentOrder.length > 0) {
          // If we already have an order, let's keep it and just fetch any missing shelves
          await dispatch(loadMissingShelves(principalForApi));
        } else {
          // Only do a full reload if we don't have any shelves yet
          await dispatch(loadShelves(principalForApi));
        }
        
        return { shelfId, referenceShelfId, before };
      } else if ("Err" in result && result.Err) {
        // If the API call failed and we did an optimistic update, we need to reload
        // to restore the correct order
        if (newShelfOrder) {
          await dispatch(loadShelves(principal));
        }
        
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to reorder shelf");
      }
    } catch (error) {
      // If there was an error and we did an optimistic update, we need to reload
      if (newShelfOrder) {
        await dispatch(loadShelves(principal));
      }
      
      return rejectWithValue(extractErrorMessage(error, "Failed to reorder shelf"));
    }
  }
); 