import { createAsyncThunk } from '@reduxjs/toolkit';
import { cacheManager } from '../cache/ShelvesCache';
import { setShelfEditors, setEditorsLoading } from '../perpetuaSlice';
import { getShelfById } from './queryThunks';
import { perpetuaService } from '../services/perpetuaService';
import { extractErrorMessage } from '../utils/perpetuaUtils';

/**
 * List editors for a shelf
 */
export const listShelfEditors = createAsyncThunk(
  'perpetua/listShelfEditors',
  async (shelfId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setEditorsLoading({ shelfId, loading: true }));
      
      // Check cache first
      const cachedData = cacheManager.get<string[]>(shelfId, 'editors');
      if (cachedData) {
        dispatch(setShelfEditors({ shelfId, editors: cachedData }));
        dispatch(setEditorsLoading({ shelfId, loading: false }));
        return cachedData;
      }
      
      // No cache hit, so fetch from API
      const result = await perpetuaService.listShelfEditors(shelfId);
      
      if ("Ok" in result && result.Ok) {
        const editorPrincipals = result.Ok;
        
        // Cache the editors
        cacheManager.set(shelfId, 'editors', editorPrincipals);
        
        // Update Redux state with editors
        dispatch(setShelfEditors({ shelfId, editors: editorPrincipals }));
        dispatch(setEditorsLoading({ shelfId, loading: false }));
        
        return editorPrincipals;
      } else if ("Err" in result && result.Err) {
        dispatch(setEditorsLoading({ shelfId, loading: false }));
        return rejectWithValue(result.Err);
      } else {
        dispatch(setEditorsLoading({ shelfId, loading: false }));
        return rejectWithValue("Failed to list shelf editors");
      }
    } catch (error) {
      console.error("Failed to list shelf editors:", error);
      dispatch(setEditorsLoading({ shelfId, loading: false }));
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
  }, { dispatch, rejectWithValue }) => {
    try {
      const result = await perpetuaService.addShelfEditor(shelfId, editorPrincipal);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate the editors cache
        cacheManager.invalidate(shelfId, 'editors');
        
        // Refresh the editors list
        dispatch(listShelfEditors(shelfId));
        
        // Get updated shelf data
        dispatch(getShelfById(shelfId));
        
        return { success: true, shelfId, editorPrincipal };
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to add editor to shelf");
      }
    } catch (error) {
      console.error("Failed to add editor to shelf:", error);
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
  }, { dispatch, rejectWithValue }) => {
    try {
      const result = await perpetuaService.removeShelfEditor(shelfId, editorPrincipal);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate the editors cache
        cacheManager.invalidate(shelfId, 'editors');
        
        // Refresh the editors list
        dispatch(listShelfEditors(shelfId));
        
        // Get updated shelf data
        dispatch(getShelfById(shelfId));
        
        return { success: true, shelfId, editorPrincipal };
      } else if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to remove editor from shelf");
      }
    } catch (error) {
      console.error("Failed to remove editor from shelf:", error);
      return rejectWithValue(extractErrorMessage(error, "Failed to remove editor from shelf"));
    }
  }
); 