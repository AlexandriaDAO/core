import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { cacheManager } from '../cache/ShelvesCache';
import { loadShelves, getShelfById } from './queryThunks';
import { 
  createShelf as createShelfService,
  updateShelfMetadata as updateShelfMetadataService,
  createAndAddShelfItem as createAndAddShelfItemService
} from '../services';
import { extractErrorMessage } from '../../utils';

/**
 * Create a new shelf
 */
export const createShelf = createAsyncThunk(
  'perpetua/createShelf',
  async ({ 
    title, 
    description, 
    principal 
  }: { 
    title: string, 
    description: string, 
    principal: Principal | string 
  }, { rejectWithValue }) => {
    try {
      const result = await createShelfService(title, description);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate all caches for this principal
        cacheManager.invalidateForPrincipal(principal);
        return { shelfId: result.Ok, principal };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Failed to create shelf");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to create shelf"));
    }
  }
);

/**
 * Update shelf metadata (title, description)
 */
export const updateShelfMetadata = createAsyncThunk(
  'perpetua/updateShelfMetadata',
  async ({
    shelfId,
    title,
    description
  }: {
    shelfId: string,
    title?: string,
    description?: string
  }, { rejectWithValue }) => {
    try {
      const result = await updateShelfMetadataService(shelfId, title, description);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate cache for this shelf
        cacheManager.invalidateForShelf(shelfId);
        return { shelfId, title, description };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Failed to update shelf metadata");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to update shelf metadata"));
    }
  }
);

/**
 * Create a new shelf and add it as an item to a parent shelf
 */
export const createAndAddShelfItem = createAsyncThunk(
  'perpetua/createAndAddShelfItem',
  async ({ 
    parentShelfId, 
    title, 
    description, 
    principal 
  }: { 
    parentShelfId: string, 
    title: string, 
    description: string, 
    principal: Principal | string 
  }, { rejectWithValue }) => {
    try {
      const result = await createAndAddShelfItemService(parentShelfId, title, description);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate all relevant caches
        cacheManager.invalidateForPrincipal(principal);
        cacheManager.invalidateForShelf(parentShelfId);
        
        // Get the shelf ID from the result
        const newShelfId = result.Ok;
        
        return { 
          success: true, 
          parentShelfId, 
          newShelfId,
          principal
        };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Unknown error creating and adding shelf item");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to create and add shelf"));
    }
  }
); 