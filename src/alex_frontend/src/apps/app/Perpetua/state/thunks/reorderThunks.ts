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
  }, { rejectWithValue }) => {
    try {      
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
        
        return { 
          shelfId, 
          referenceShelfId, 
          before,
          principal: principalForApi, 
          newShelfOrder,
          success: true
        };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Failed to reorder shelf");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to reorder shelf"));
    }
  }
); 