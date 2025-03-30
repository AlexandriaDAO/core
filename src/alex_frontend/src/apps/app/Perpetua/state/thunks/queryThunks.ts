import { createAsyncThunk } from '@reduxjs/toolkit';
import { Shelf } from '@/../../declarations/perpetua/perpetua.did';
import { Principal } from '@dfinity/principal';
import { updateSingleShelf } from '../perpetuaSlice';
import { cacheManager } from '../cache/ShelvesCache';
import { perpetuaService } from '../services/perpetuaService';
import { principalToString, extractErrorMessage } from '../utils/perpetuaUtils';

/**
 * Load shelves for a user
 */
export const loadShelves = createAsyncThunk(
  'perpetua/loadShelves',
  async (principal: Principal | string, { rejectWithValue }) => {
    try {
      // Create a stable string ID for normalized principal
      const principalStr = principalToString(principal);
      
      // Check cache first with the 'shelves' type
      const cachedData = cacheManager.get<Shelf[]>(principalStr, 'userShelves');
      if (cachedData) {
        return cachedData;
      }
      
      // No cache hit, so fetch from API
      const result = await perpetuaService.getUserShelves(principal);
      
      if ("Ok" in result && result.Ok) {
        // Store in cache
        cacheManager.set(principalStr, 'userShelves', result.Ok);
        return result.Ok;
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to load shelves");
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to load shelves"));
    }
  }
);

/**
 * Get a shelf by ID
 */
export const getShelfById = createAsyncThunk(
  'perpetua/getShelfById',
  async (shelfId: string, { dispatch, rejectWithValue }) => {
    try {
      // Check cache first with the 'shelf' type
      const cachedData = cacheManager.get<Shelf>(shelfId, 'shelf');
      if (cachedData) {
        // Update the Redux store with the cached shelf
        dispatch(updateSingleShelf(cachedData));
        return cachedData;
      }
      
      // No cache hit, so fetch from API
      const result = await perpetuaService.getShelf(shelfId);
      
      if ("Ok" in result && result.Ok) {
        // Update the cache
        cacheManager.set(shelfId, 'shelf', result.Ok);
        
        // Update the Redux store
        dispatch(updateSingleShelf(result.Ok));
        
        return result.Ok;
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue(`Failed to load shelf ${shelfId}`);
      }
    } catch (error) {
      console.error(`Error fetching shelf ${shelfId}:`, error);
      return rejectWithValue(extractErrorMessage(error, `Failed to load shelf ${shelfId}`));
    }
  }
);

/**
 * Load recent public shelves
 */
export const loadRecentShelves = createAsyncThunk(
  'perpetua/loadRecentShelves',
  async ({ 
    limit = 20, 
    beforeTimestamp 
  }: { 
    limit?: number, 
    beforeTimestamp?: string | bigint 
  }, { rejectWithValue }) => {
    try {
      // Check cache only if this is the initial load (no beforeTimestamp)
      if (!beforeTimestamp) {
        const cachedData = cacheManager.get<any>('recent', 'publicShelves');
        if (cachedData) {
          return cachedData;
        }
      }
      
      // No cache hit or pagination request, so fetch from API
      const result = await perpetuaService.getRecentShelves(limit, beforeTimestamp);
      
      if ("Ok" in result && result.Ok) {
        // Only cache the initial load (no beforeTimestamp)
        if (!beforeTimestamp) {
          cacheManager.set('recent', 'publicShelves', result.Ok);
        }
        
        return result.Ok;
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to load recent shelves");
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to load recent shelves"));
    }
  }
);

/**
 * Load only missing shelves without disturbing the order
 */
export const loadMissingShelves = createAsyncThunk(
  'perpetua/loadMissingShelves',
  async (principal: Principal | string, { rejectWithValue, getState }) => {
    try {
      // Get the current user shelves from state
      const state = getState() as any;
      const existingShelves = state?.perpetua?.entities?.shelves || {};
      
      // Fetch all shelves from the API
      const result = await perpetuaService.getUserShelves(principal);
      
      if ("Ok" in result && result.Ok) {
        const shelves = result.Ok;
        
        // Update the cache
        cacheManager.set(principalToString(principal), 'userShelves', shelves);
        
        // Filter out only the shelves that don't exist in state yet
        // This ensures we don't disturb the existing order
        return shelves.filter((shelf: any) => !existingShelves[shelf.shelf_id]);
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to load shelves");
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to load shelves"));
    }
  }
); 