import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { cacheManager } from '../cache/ShelvesCache';
import { updateShelfOrder, updateItemOrder } from '../perpetuaSlice';
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
    principal,
    newItemOrder // Optional parameter for the complete new order
  }: { 
    shelfId: string, 
    itemId: number, 
    referenceItemId: number | null, 
    before: boolean,
    principal: Principal | string,
    newItemOrder?: number[] // Optional complete order for optimistic updates
  }, { rejectWithValue }) => {
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
        
        return { 
          shelfId, 
          itemId, 
          referenceItemId, 
          before, 
          newItemOrder,
          success: true
        };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Failed to reorder item");
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
        await dispatch(loadShelves(principalStr)).unwrap();
        
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
        dispatch(loadShelves(principalStr));
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Failed to reorder shelf");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to reorder shelf"));
    }
  }
); 