import { createAsyncThunk } from '@reduxjs/toolkit';
import { cacheManager } from '../cache/ShelvesCache';
import { perpetuaService } from '../services/perpetuaService';
import { extractErrorMessage } from '../../utils';

/**
 * List editors for a shelf
 */
export const listShelfEditors = createAsyncThunk(
  'perpetua/listShelfEditors',
  async (shelfId: string, { rejectWithValue }) => {
    try {
      // Check cache first
      const cachedData = cacheManager.get<string[]>(shelfId, 'editors');
      if (cachedData) {
        return { shelfId, editors: cachedData };
      }
      
      // No cache hit, so fetch from API
      const result = await perpetuaService.listShelfEditors(shelfId);
      
      if ("Ok" in result && result.Ok) {
        const editorPrincipals = result.Ok;
        
        // Cache the editors
        cacheManager.set(shelfId, 'editors', editorPrincipals);
        
        return { shelfId, editors: editorPrincipals };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Failed to list shelf editors");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to list shelf editors"));
    }
  }
);

/**
 * Add an editor to a shelf
 */
export const addShelfEditor = createAsyncThunk(
  'perpetua/addShelfEditor',
  async ({
    shelfId,
    editorPrincipal
  }: {
    shelfId: string,
    editorPrincipal: string
  }, { rejectWithValue }) => {
    try {
      const result = await perpetuaService.addShelfEditor(shelfId, editorPrincipal);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate the editors cache
        cacheManager.invalidate(shelfId, 'editors');
        
        return { success: true, shelfId, editorPrincipal };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Failed to add editor to shelf");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to add editor to shelf"));
    }
  }
);

/**
 * Remove an editor from a shelf
 */
export const removeShelfEditor = createAsyncThunk(
  'perpetua/removeShelfEditor',
  async ({
    shelfId,
    editorPrincipal
  }: {
    shelfId: string,
    editorPrincipal: string
  }, { rejectWithValue }) => {
    try {
      const result = await perpetuaService.removeShelfEditor(shelfId, editorPrincipal);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate the editors cache
        cacheManager.invalidate(shelfId, 'editors');
        
        return { success: true, shelfId, editorPrincipal };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Failed to remove editor from shelf");
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to remove editor from shelf"));
    }
  }
); 