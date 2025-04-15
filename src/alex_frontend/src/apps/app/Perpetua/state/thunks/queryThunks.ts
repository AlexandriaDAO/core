import { createAsyncThunk } from '@reduxjs/toolkit';
import { Shelf } from '@/../../declarations/perpetua/perpetua.did';
import { Principal } from '@dfinity/principal';
import { updateSingleShelf } from '../perpetuaSlice';
import { cacheManager } from '../cache/ShelvesCache';
import { perpetuaService } from '../services/perpetuaService';
import { principalToString, extractErrorMessage } from '../../utils';

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
  async (shelfId: string, { rejectWithValue }) => {
    try {
      // Check cache first with the 'shelf' type
      const cachedData = cacheManager.get<Shelf>(shelfId, 'shelf');
      if (cachedData) {
        return cachedData;
      }
      
      // No cache hit, so fetch from API
      const result = await perpetuaService.getShelf(shelfId);
      
      if ("Ok" in result && result.Ok) {
        // Update the cache
        cacheManager.set(shelfId, 'shelf', result.Ok);
        
        return result.Ok;
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue(`Failed to load shelf ${shelfId}`);
    } catch (error) {
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

// # Tag Thunks #

/**
 * Fetch popular tags
 */
export const fetchPopularTags = createAsyncThunk(
  'perpetua/fetchPopularTags',
  async (limit: number | undefined, { rejectWithValue }) => {
    const effectiveLimit = limit ?? 20; // Use default if limit is undefined
    try {
      // Use effectiveLimit in cache key and service call
      const cacheKey = `popularTags_${effectiveLimit}`;
      
      // Check cache first
      const cachedData = cacheManager.get<string[]>(cacheKey, 'tags');
      if (cachedData) {
        return cachedData;
      }
      
      // Fetch from service
      const result = await perpetuaService.getPopularTags(effectiveLimit);
      
      if ("Ok" in result && result.Ok) {
        // Update cache
        cacheManager.set(cacheKey, 'tags', result.Ok);
        return result.Ok;
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to fetch popular tags");
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to fetch popular tags"));
    }
  }
);

/**
 * Fetch shelf IDs by tag
 */
export const fetchShelvesByTag = createAsyncThunk(
  'perpetua/fetchShelvesByTag',
  async (tag: string, { rejectWithValue, dispatch }) => {
    try {
      // Cache key for shelves by tag
      const cacheKey = `shelvesByTag_${tag}`;
      
      // Check cache first
      const cachedData = cacheManager.get<string[]>(cacheKey, 'tags');
      if (cachedData) {
        // Return the cached shelf IDs and the tag
        return { tag, shelfIds: cachedData };
      }
      
      // Fetch from service
      const result = await perpetuaService.getShelvesByTag(tag);
      
      if ("Ok" in result && result.Ok) {
        const shelfIds = result.Ok;
        // Update cache
        cacheManager.set(cacheKey, 'tags', shelfIds);
        
        // Optional: Fetch full shelf data for missing shelves
        // This depends on whether the UI needs full data immediately.
        // If needed, dispatch getShelfById for each ID not in the state.
        
        // Return the tag and the fetched shelf IDs
        return { tag, shelfIds };
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue(`Failed to fetch shelves for tag ${tag}`);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, `Failed to fetch shelves for tag ${tag}`));
    }
  }
);

/**
 * Fetch shelf count for a tag
 */
export const fetchTagShelfCount = createAsyncThunk(
  'perpetua/fetchTagShelfCount',
  async (tag: string, { rejectWithValue }) => {
    try {
      // Cache key for tag count
      const cacheKey = `tagCount_${tag}`;
      
      // Check cache first
      const cachedData = cacheManager.get<number>(cacheKey, 'tags');
      if (cachedData !== undefined && cachedData !== null) { // Check for null/undefined too
        return { tag, count: cachedData };
      }
      
      // Fetch from service
      const result = await perpetuaService.getTagShelfCount(tag);
      
      if ("Ok" in result && typeof result.Ok === 'number') {
        const count = result.Ok;
        // Update cache
        cacheManager.set(cacheKey, 'tags', count);
        return { tag, count };
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue(`Failed to fetch count for tag ${tag}`);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, `Failed to fetch count for tag ${tag}`));
    }
  }
);

/**
 * Fetch tags with a specific prefix
 */
export const fetchTagsWithPrefix = createAsyncThunk(
  'perpetua/fetchTagsWithPrefix',
  async (prefix: string, { rejectWithValue }) => {
    try {
      // No caching for prefix search as results can change frequently
      const result = await perpetuaService.getTagsWithPrefix(prefix);
      
      if ("Ok" in result && result.Ok) {
        return result.Ok; // Return the array of matching tags
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue(`Failed to fetch tags with prefix ${prefix}`);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, `Failed to fetch tags with prefix ${prefix}`));
    }
  }
); 