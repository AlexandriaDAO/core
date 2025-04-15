import { createAsyncThunk } from '@reduxjs/toolkit';
import { Shelf } from '@/../../declarations/perpetua/perpetua.did';
import { Principal } from '@dfinity/principal';
import { updateSingleShelf } from '../perpetuaSlice';
import { cacheManager } from '../cache/ShelvesCache';
import { 
  perpetuaService, 
  OffsetPaginationParams, 
  CursorPaginationParams, 
  OffsetPaginatedResponse, 
  CursorPaginatedResponse, 
  TimestampCursor, 
  TagPopularityKeyCursor, 
  TagShelfAssociationKeyCursor, 
  NormalizedTagCursor
} from '../services/perpetuaService';
import { principalToString, extractErrorMessage } from '../../utils';

// Define a type for the rejectWithValue result
type RejectValue = string;

/**
 * Load shelves for a user (Paginated)
 */
export const loadShelves = createAsyncThunk<
  OffsetPaginatedResponse<Shelf>, // Return type on success
  { principal: Principal | string; params: OffsetPaginationParams }, // Argument type
  { rejectValue: RejectValue } // Type for rejectWithValue
>(
  'perpetua/loadShelves',
  async ({ principal, params }, { rejectWithValue }) => {
    try {
      const principalStr = principalToString(principal);
      // Caching removed for paginated endpoint
      
      const result = await perpetuaService.getUserShelves(principal, params);
      
      if ("Ok" in result && result.Ok) {
        return result.Ok; 
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err as RejectValue);
      } else {
        return rejectWithValue("Failed to load shelves" as RejectValue);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to load shelves") as RejectValue);
    }
  }
);

/**
 * Get a shelf by ID (Not Paginated - Keep Caching)
 */
export const getShelfById = createAsyncThunk<
  Shelf, // Return type on success
  string, // Argument type (shelfId)
  { rejectValue: RejectValue } // Type for rejectWithValue
>(
  'perpetua/getShelfById',
  async (shelfId, { rejectWithValue }) => {
    try {
      const cachedData = cacheManager.get<Shelf>(shelfId, 'shelf');
      if (cachedData) {
        return cachedData;
      }
      
      const result = await perpetuaService.getShelf(shelfId);
      
      if ("Ok" in result && result.Ok) {
        cacheManager.set(shelfId, 'shelf', result.Ok);
        return result.Ok;
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err as RejectValue);
      }
      
      return rejectWithValue(`Failed to load shelf ${shelfId}` as RejectValue);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, `Failed to load shelf ${shelfId}`) as RejectValue);
    }
  }
);

/**
 * Load recent public shelves (Paginated)
 */
export const loadRecentShelves = createAsyncThunk<
  CursorPaginatedResponse<Shelf, TimestampCursor>, // Return type
  CursorPaginationParams<TimestampCursor>, // Argument type
  { rejectValue: RejectValue } // Reject type
>(
  'perpetua/loadRecentShelves',
  async (params, { rejectWithValue }) => {
    try {
      // Caching removed for paginated endpoint
      
      const result = await perpetuaService.getRecentShelves(params);
      
      if ("Ok" in result && result.Ok) {
        return result.Ok; 
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err as RejectValue);
      } else {
        return rejectWithValue("Failed to load recent shelves" as RejectValue);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to load recent shelves") as RejectValue);
    }
  }
);

/**
 * Load only missing shelves without disturbing the order
 * NOTE: This thunk might need rethinking with pagination. 
 * Loading all pages to diff is inefficient.
 * For now, it just loads the *first* page and filters.
 */
export const loadMissingShelves = createAsyncThunk<
  Shelf[], // Return type (array of missing shelves)
  Principal | string, // Argument type (principal)
  { rejectValue: RejectValue, state: any } // Reject type and state type
>(
  'perpetua/loadMissingShelves',
  async (principal, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const existingShelves = state?.perpetua?.entities?.shelves || {};
      
      const params: OffsetPaginationParams = { offset: 0, limit: 50 }; 
      const result = await perpetuaService.getUserShelves(principal, params);
      
      if ("Ok" in result && result.Ok) {
        const shelves = result.Ok.items;
        return shelves.filter((shelf: any) => !existingShelves[shelf.shelf_id]);
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err as RejectValue);
      } else {
        return rejectWithValue("Failed to load shelves" as RejectValue);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to load shelves") as RejectValue);
    }
  }
);

// # Tag Thunks #

/**
 * Fetch popular tags (Paginated)
 */
export const fetchPopularTags = createAsyncThunk<
  CursorPaginatedResponse<string, TagPopularityKeyCursor>, // Return type
  CursorPaginationParams<TagPopularityKeyCursor>, // Argument type
  { rejectValue: RejectValue } // Reject type
>(
  'perpetua/fetchPopularTags',
  async (params, { rejectWithValue }) => {
    try {
      // Caching removed for paginated endpoint
      const result = await perpetuaService.getPopularTags(params);
      
      if ("Ok" in result && result.Ok) {
        return result.Ok;
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err as RejectValue);
      } else {
        return rejectWithValue("Failed to fetch popular tags" as RejectValue);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to fetch popular tags") as RejectValue);
    }
  }
);

/**
 * Fetch shelf IDs by tag (Paginated)
 */
export const fetchShelvesByTag = createAsyncThunk<
  { tag: string; response: CursorPaginatedResponse<string, TagShelfAssociationKeyCursor> }, // Return type
  { tag: string; params: CursorPaginationParams<TagShelfAssociationKeyCursor> }, // Argument type
  { rejectValue: RejectValue } // Reject type
>(
  'perpetua/fetchShelvesByTag',
  async ({ tag, params }, { rejectWithValue, dispatch }) => {
    try {
      // Caching removed for paginated endpoint
      const result = await perpetuaService.getShelvesByTag(tag, params);
      
      if ("Ok" in result && result.Ok) {
        return { tag, response: result.Ok }; 
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err as RejectValue);
      } else {
        return rejectWithValue(`Failed to fetch shelves for tag ${tag}` as RejectValue);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, `Failed to fetch shelves for tag ${tag}`) as RejectValue);
    }
  }
);

/**
 * Fetch shelf count for a tag (Not Paginated - Keep Caching)
 */
export const fetchTagShelfCount = createAsyncThunk<
  { tag: string; count: number }, // Return type
  string, // Argument type (tag)
  { rejectValue: RejectValue } // Reject type
>(
  'perpetua/fetchTagShelfCount',
  async (tag, { rejectWithValue }) => {
    try {
      const cacheKey = `tagCount_${tag}`;
      const cachedData = cacheManager.get<number>(cacheKey, 'tags');
      if (cachedData !== undefined && cachedData !== null) { 
        return { tag, count: cachedData };
      }
      
      const result = await perpetuaService.getTagShelfCount(tag);
      
      if ("Ok" in result && typeof result.Ok === 'number') {
        const count = result.Ok;
        cacheManager.set(cacheKey, 'tags', count);
        return { tag, count };
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err as RejectValue);
      } else {
        return rejectWithValue(`Failed to fetch count for tag ${tag}` as RejectValue);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, `Failed to fetch count for tag ${tag}`) as RejectValue);
    }
  }
);

/**
 * Fetch tags with a specific prefix (Paginated)
 */
export const fetchTagsWithPrefix = createAsyncThunk<
  CursorPaginatedResponse<string, NormalizedTagCursor>, // Return type
  { prefix: string; params: CursorPaginationParams<NormalizedTagCursor> }, // Argument type
  { rejectValue: RejectValue } // Reject type
>(
  'perpetua/fetchTagsWithPrefix',
  async ({ prefix, params }, { rejectWithValue }) => {
    try {
      // Caching removed for paginated endpoint
      const result = await perpetuaService.getTagsWithPrefix(prefix, params);
      
      if ("Ok" in result && result.Ok) {
        return result.Ok; 
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err as RejectValue);
      } else {
        return rejectWithValue(`Failed to fetch tags with prefix ${prefix}` as RejectValue);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, `Failed to fetch tags with prefix ${prefix}`) as RejectValue);
    }
  }
); 