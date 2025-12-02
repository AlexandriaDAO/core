import { createAsyncThunk } from '@reduxjs/toolkit';
import { cacheManager } from '../cache/ShelvesCache';
import { 
  isShelfPublic,
  toggleShelfPublicAccess as toggleShelfPublicAccessService
} from '../services';
import { extractErrorMessage } from '../../utils';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../../../declarations/perpetua/perpetua.did';

/**
 * Check if a shelf is publicly editable
 */
export const checkShelfPublicAccess = createAsyncThunk(
  'perpetua/checkShelfPublicAccess',
  async ({actor, shelfId}: {actor: ActorSubclass<_SERVICE>, shelfId: string}, { rejectWithValue }) => {
    try {
      // Check cache first
      const cachedData = cacheManager.get<boolean>(shelfId, 'isPublic');
      if (cachedData !== undefined) {
        return { shelfId, isPublic: cachedData };
      }
      
      // No cache hit, so fetch from API
      const result = await isShelfPublic(actor, shelfId);
      
      if ("Ok" in result) {
        const isPublic = result.Ok;
        
        // Cache the public status
        cacheManager.set(shelfId, 'isPublic', isPublic);
        
        return { shelfId, isPublic };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue("Failed to check shelf public status");
    } catch (error) {
      const errorMsg = extractErrorMessage(error, "Failed to check shelf public status");
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Toggle public access for a shelf
 */
export const toggleShelfPublicAccess = createAsyncThunk(
  'perpetua/toggleShelfPublicAccess',
  async ({
    actor,
    shelfId,
    isPublic
  }: {
    actor: ActorSubclass<_SERVICE>,
    shelfId: string,
    isPublic: boolean
  }, { rejectWithValue }) => {
    try {
      const result = await toggleShelfPublicAccessService(actor, shelfId, isPublic);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate the public status cache
        cacheManager.invalidate(shelfId, 'isPublic');
        
        return { success: true, shelfId, isPublic };
      } 
      
      if ("Err" in result && result.Err) {
        return rejectWithValue(result.Err);
      }
      
      return rejectWithValue(`Failed to ${isPublic ? 'enable' : 'disable'} public access for shelf`);
    } catch (error) {
      const errorMsg = extractErrorMessage(error, `Failed to ${isPublic ? 'enable' : 'disable'} public access for shelf`);
      return rejectWithValue(errorMsg);
    }
  }
); 