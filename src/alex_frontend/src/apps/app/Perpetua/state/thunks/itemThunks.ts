import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { cacheManager } from '../cache/ShelvesCache';
import { perpetuaService } from '../services/perpetuaService';
import { Shelf } from '@/../../declarations/perpetua/perpetua.did';
import { extractErrorMessage } from '../../utils';

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
    referenceItemId = null,
    before = true
  }: { 
    shelf: Shelf, 
    content: string, 
    type: "Nft" | "Markdown" | "Shelf",
    principal: Principal | string,
    referenceItemId?: number | null,
    before?: boolean
  }, { rejectWithValue }) => {
    try {
      const result = await perpetuaService.addItemToShelf(
        shelf.shelf_id,
        content,
        type,
        referenceItemId,
        before
      );
      
      if ("Ok" in result && result.Ok) {
        // Invalidate caches for this shelf and principal
        cacheManager.invalidateForShelf(shelf.shelf_id);
        cacheManager.invalidateForPrincipal(principal);
        
        return { shelf_id: shelf.shelf_id };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Unknown error adding item");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to add item"));
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
      const result = await perpetuaService.removeItemFromShelf(shelfId, itemId);
      
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