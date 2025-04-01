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
  }, { dispatch, rejectWithValue }) => {
    try {
      // Apply optimistic update if we have a newItemOrder
      if (newItemOrder) {
        dispatch(updateItemOrder({ shelfId, itemIds: newItemOrder }));
      }
      
      // Make sure we're calling the backend
      console.log("Calling backend with:", { shelfId, itemId, referenceItemId, before });
      
      const result = await perpetuaService.reorderShelfItem(
        shelfId,
        itemId,
        referenceItemId,
        before
      );
      
      console.log("Backend returned:", result);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate caches for this shelf
        cacheManager.invalidateForShelf(shelfId);
        
        // Fetch the updated shelf data
        dispatch(getShelfById(shelfId));
        
        return { shelfId, itemId, referenceItemId, before };
      } else if ("Err" in result && result.Err) {
        // If the API call failed and we did an optimistic update, we need to reload
        // to restore the correct order
        if (newItemOrder) {
          dispatch(getShelfById(shelfId));
        }
        
        return rejectWithValue(result.Err);
      } else {
        // Also reload on general failure if we did an optimistic update
        if (newItemOrder) {
          dispatch(getShelfById(shelfId));
        }
        
        return rejectWithValue("Failed to reorder item");
      }
    } catch (error) {
      // If there was an error and we did an optimistic update, we need to reload
      if (newItemOrder) {
        dispatch(getShelfById(shelfId));
      }
      
      return rejectWithValue(extractErrorMessage(error, "Failed to reorder item"));
    }
  }
);

/**
 * Helper function to check if shelf order is being preserved in Redux
 */
function checkShelfOrderMaintenance(getState: any, newShelfOrder?: string[]) {
  const state = getState();
  const currentOrder = state?.perpetua?.ids?.userShelves || [];
  
  console.log("[reorderProfileShelf] CHECK: Current Redux order:", currentOrder);
  
  if (newShelfOrder) {
    const orderMatches = JSON.stringify(currentOrder) === JSON.stringify(newShelfOrder);
    console.log("[reorderProfileShelf] CHECK: Matches newShelfOrder?", orderMatches);
    
    if (!orderMatches) {
      console.log("[reorderProfileShelf] CHECK: MISMATCH! Expected:", newShelfOrder, "Actual:", currentOrder);
    }
  }
  
  return currentOrder;
}

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
  }, { dispatch, rejectWithValue, getState }) => {
    try {
      // If we have the complete new order, update it optimistically in Redux
      if (newShelfOrder) {
        console.log("[reorderProfileShelf] Applying optimistic update with order:", newShelfOrder);
        dispatch(updateShelfOrder(newShelfOrder));
        
        // Check if the order was actually updated in Redux
        checkShelfOrderMaintenance(getState, newShelfOrder);
      }
      
      const result = await perpetuaService.reorderProfileShelf(
        shelfId,
        referenceShelfId,
        before
      );
      
      console.log("[reorderProfileShelf] Backend API result:", result);
      
      if ("Ok" in result && result.Ok) {
        // Invalidate all relevant caches
        cacheManager.invalidateForPrincipal(principal);
        cacheManager.invalidateForShelf(shelfId);
        if (referenceShelfId) {
          cacheManager.invalidateForShelf(referenceShelfId);
        }
        
        // Convert principal for API if needed
        const principalForApi = toPrincipal(principal);
        
        // Check if the optimistic order is still maintained
        const preLoadOrder = checkShelfOrderMaintenance(getState, newShelfOrder);
        
        // Instead of force-reloading shelves which would overwrite our custom order,
        // just make sure any newly created shelves are loaded
        // We've already updated the order optimistically
        if (preLoadOrder.length > 0) {
          // If we already have an order, let's keep it and just fetch any missing shelves
          console.log("[reorderProfileShelf] Calling loadMissingShelves to preserve order");
          await dispatch(loadMissingShelves(principalForApi));
          
          // Check if our order is still preserved after loading missing shelves
          checkShelfOrderMaintenance(getState, newShelfOrder);
        } else {
          // Only do a full reload if we don't have any shelves yet
          console.log("[reorderProfileShelf] Calling loadShelves (full reload)");
          await dispatch(loadShelves(principalForApi));
        }
        
        return { shelfId, referenceShelfId, before };
      } else if ("Err" in result && result.Err) {
        // If the API call failed and we did an optimistic update, we need to reload
        // to restore the correct order
        if (newShelfOrder) {
          console.log("[reorderProfileShelf] API error, reloading shelves to restore order");
          await dispatch(loadShelves(principal));
        }
        
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to reorder shelf");
      }
    } catch (error) {
      // If there was an error and we did an optimistic update, we need to reload
      if (newShelfOrder) {
        console.log("[reorderProfileShelf] Exception, reloading shelves to restore order", error);
        await dispatch(loadShelves(principal));
      }
      
      return rejectWithValue(extractErrorMessage(error, "Failed to reorder shelf"));
    }
  }
); 