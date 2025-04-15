import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { cacheManager } from '../cache/ShelvesCache';
import { updateShelfOrder, updateItemOrder } from '../perpetuaSlice';
import { getShelfById, loadShelves, loadMissingShelves } from './queryThunks';
import { perpetuaService } from '../services/perpetuaService';
import { toPrincipal, extractErrorMessage } from '../../utils';

/**
 * Set the absolute order of items within a shelf
 */
export const setItemOrder = createAsyncThunk(
  'perpetua/setItemOrder',
  async ({
    shelfId,
    orderedItemIds,
    principal // Add principal if needed for cache invalidation or logging
  }: {
    shelfId: string;
    orderedItemIds: number[];
    principal: Principal | string; // Pass principal for consistency if needed
  }, { rejectWithValue }) => {
    try {
      const result = await perpetuaService.setItemOrder(shelfId, orderedItemIds);

      if ("Ok" in result) {
        // Invalidate caches for this shelf
        cacheManager.invalidateForShelf(shelfId);

        // The thunk needs to return serializable data
        return {
          shelfId,
          newItemOrder: orderedItemIds, // Return the confirmed new order
          success: true,
        };
      }

      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }

      return rejectWithValue("Failed to set item order");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to set item order"));
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
  }, { rejectWithValue, dispatch }) => {
    try {      
      // Ensure principal is a string to avoid serialization issues
      const principalStr = typeof principal === 'string' 
        ? principal 
        : principal.toString();
        
      // CRITICAL: Apply optimistic update immediately before API call for responsive UI
      if (newShelfOrder) {
        // Directly update the Redux store with the new order
        dispatch(updateShelfOrder(newShelfOrder));
      }
      
      // Then make the actual API call
      const result = await perpetuaService.reorderProfileShelf(
        shelfId,
        referenceShelfId,
        before
      );
      
      if ("Ok" in result) {
        // Invalidate all relevant caches
        cacheManager.invalidateForPrincipal(principalStr);
        cacheManager.invalidateForShelf(shelfId);
        if (referenceShelfId) {
          cacheManager.invalidateForShelf(referenceShelfId);
        }
        
        // Force a reload of shelves to ensure we get the updated order
        await dispatch(loadShelves({ 
          principal: principalStr, 
          params: { offset: 0, limit: 20 }
        })).unwrap();
        
        // Return serializable values only
        return { 
          shelfId, 
          referenceShelfId, 
          before,
          principal: principalStr, // Use string instead of Principal object
          newShelfOrder,
          success: true
        };
      } 
      
      if ("Err" in result && result.Err) {
        // If there's an error, revert the optimistic update by forcing a refetch
        await dispatch(loadShelves({ 
          principal: principalStr, 
          params: { offset: 0, limit: 20 }
        })).unwrap();
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Failed to reorder shelf");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to reorder shelf"));
    }
  }
); 