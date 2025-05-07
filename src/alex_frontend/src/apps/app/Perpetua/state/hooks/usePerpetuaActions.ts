import { useDispatch } from 'react-redux';
import { Principal } from '@dfinity/principal';
import { ShelfPublic } from '@/../../declarations/perpetua/perpetua.did';
import { AppDispatch } from '@/store';

// Import slice actions
import {
  setSelectedShelf,
  clearPermissions,
  clearError,
  updateShelfOrder,
} from '../perpetuaSlice';

// Import all thunks
import {
  loadShelves,
  getShelfById,
  loadRecentShelves,
  loadMissingShelves,
  createShelf,
  updateShelfMetadata,
  addItem,
  removeItem,
  setItemOrder,
  reorderProfileShelf,
  checkShelfPublicAccess,
  toggleShelfPublicAccess,
} from '../thunks';

/**
 * Custom hook providing actions for Perpetua state management
 * 
 * This centralizes all the Redux actions and thunks in one place
 * for easier consumption by React components
 */
export const usePerpetuaActions = () => {
  // Use properly typed dispatch
  const dispatch = useDispatch<AppDispatch>();

  return {
    // Shelf selection and navigation
    selectShelf: (shelf: ShelfPublic | string | null) => 
      dispatch(setSelectedShelf(shelf)),
    
    // Permission management
    clearPermissions: () => dispatch(clearPermissions()),
    
    // Error handling
    clearError: () => dispatch(clearError()),
    
    // Query actions
    loadShelves: (principal: Principal | string) => 
      dispatch(loadShelves({ 
        principal, 
        params: { offset: 0, limit: 20 }
      })),
    getShelf: (shelfId: string) => 
      dispatch(getShelfById(shelfId)),
    loadRecentShelves: (params: { limit?: number, beforeTimestamp?: string | bigint }) => 
      dispatch(loadRecentShelves({ 
        limit: params.limit || 20, 
        cursor: params.beforeTimestamp 
      })),
    loadMissingShelves: (principal: Principal | string) => 
      dispatch(loadMissingShelves(principal)),
    
    // Shelf management
    createShelf: (params: { title: string, description: string, principal: Principal | string }) => 
      dispatch(createShelf(params)),
    updateShelfMetadata: (params: { shelfId: string, title?: string, description?: string }) => 
      dispatch(updateShelfMetadata(params)),
    
    // Item management
    addItem: (params: { 
      shelf: ShelfPublic, 
      content: string, 
      type: "Nft" | "Markdown" | "Shelf",
      principal: Principal | string,
      referenceItemId?: number | null,
      before?: boolean
    }) => dispatch(addItem(params)),
    removeItem: (params: { 
      shelfId: string, 
      itemId: number, 
      principal: Principal | string 
    }) => dispatch(removeItem(params)),
    
    // Ordering and arrangement
    setItemOrder: (params: {
      shelfId: string;
      orderedItemIds: number[];
      principal: Principal | string;
    }) => dispatch(setItemOrder(params)),
    reorderProfileShelf: (params: { 
      shelfId: string, 
      referenceShelfId: string | null, 
      before: boolean,
      principal: Principal | string,
      newShelfOrder?: string[]
    }) => dispatch(reorderProfileShelf(params)),
    updateShelfOrder: (newOrder: string[]) => 
      dispatch(updateShelfOrder(newOrder)),
    
    // Public access features
    checkShelfPublicAccess: async (shelfId: string) => {
      try {
        return await dispatch(checkShelfPublicAccess(shelfId)).unwrap();
      } catch (error) {
        console.error("Failed to check shelf public access:", error);
        return null;
      }
    },
    toggleShelfPublicAccess: async (params: { shelfId: string, isPublic: boolean }) => {
      try {
        const result = await dispatch(toggleShelfPublicAccess(params)).unwrap();
        return result;
      } catch (error) {
        console.error("Failed to toggle shelf public access:", error);
        return null;
      }
    },
  };
}; 