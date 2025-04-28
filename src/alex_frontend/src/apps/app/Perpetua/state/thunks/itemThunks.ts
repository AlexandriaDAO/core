import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { cacheManager } from '../cache/ShelvesCache';
import { 
  addItemToShelf as addItemToShelfService,
  removeItemFromShelf as removeItemFromShelfService
} from '../services';
import { ShelfPublic } from '@/../../declarations/perpetua/perpetua.did';
import { extractErrorMessage } from '../../utils';

// Define Result type for better type checking
export type AddItemResult = 
  | { status: 'success', shelf_id: string, backend_result?: any }
  | { status: 'error', message: string, backend_result?: any };

/**
 * Add an item to a shelf
 */
export const addItem = createAsyncThunk(
  'perpetua/addItem',
  async ({ 
    shelf, 
    content, 
    type, 
    principal,
    collectionType,
    referenceItemId = null,
    before = true
  }: { 
    shelf: ShelfPublic, 
    content: string, 
    type: "Nft" | "Markdown" | "Shelf",
    principal: Principal | string,
    collectionType?: "NFT" | "SBT",
    referenceItemId?: number | null,
    before?: boolean
  }, { rejectWithValue }) => {
    try {
      const result = await addItemToShelfService(
        shelf.shelf_id,
        content,
        type,
        referenceItemId,
        before,
        collectionType
      );
      
      if ("Ok" in result && result.Ok) {
        // Invalidate caches for this shelf and principal
        cacheManager.invalidateForShelf(shelf.shelf_id);
        cacheManager.invalidateForPrincipal(principal);
        
        // If a shelf was added, invalidate the cache for that nested shelf too
        if (type === "Shelf") {
          cacheManager.invalidateForShelf(content);
        }
        
        return { 
          status: 'success' as const, 
          shelf_id: shelf.shelf_id,
          // Include the original Result.Ok data in case it's needed
          backend_result: result.Ok
        };
      } 
      
      if ("Err" in result && result.Err) {
        // Return a structured error with the backend message
        return { 
          status: 'error' as const, 
          message: result.Err,
          // Include the original Result.Err data
          backend_result: result.Err
        };
      }
      
      return { status: 'error' as const, message: "Unknown error adding item" };
    } catch (error) {
      const errorMsg = extractErrorMessage(error, "Failed to add item");
      return { status: 'error' as const, message: errorMsg };
    }
  }
);

/**
 * Remove an item from a shelf
 */
export const removeItem = createAsyncThunk(
  'perpetua/removeItem',
  async ({ 
    shelfId, 
    itemId, 
    principal 
  }: { 
    shelfId: string, 
    itemId: number, 
    principal: Principal | string 
  }, { rejectWithValue }) => {
    try {
      const result = await removeItemFromShelfService(shelfId, itemId);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate cache for this shelf
        cacheManager.invalidateForShelf(shelfId);
        
        return { success: true, shelfId, itemId };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Unknown error removing item");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to remove item"));
    }
  }
); 