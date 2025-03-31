import { useDispatch } from 'react-redux';
import { Principal } from '@dfinity/principal';
import { Shelf } from '@/../../declarations/perpetua/perpetua.did';
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
  rebalanceShelfItems,
  createAndAddShelfItem,
  addItem,
  removeItem,
  reorderItem,
  reorderProfileShelf,
  listShelfEditors,
  addShelfEditor,
  removeShelfEditor,
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
    selectShelf: (shelf: Shelf | string | null) => 
      dispatch(setSelectedShelf(shelf)),
    
    // Permission management
    clearPermissions: () => dispatch(clearPermissions()),
    
    // Error handling
    clearError: () => dispatch(clearError()),
    
    // Query actions
    loadShelves: (principal: Principal | string) => 
      dispatch(loadShelves(principal)),
    getShelf: (shelfId: string) => 
      dispatch(getShelfById(shelfId)),
    loadRecentShelves: (params: { limit?: number, beforeTimestamp?: string | bigint }) => 
      dispatch(loadRecentShelves(params)),
    loadMissingShelves: (principal: Principal | string) => 
      dispatch(loadMissingShelves(principal)),
    
    // Shelf management
    createShelf: (params: { title: string, description: string, principal: Principal | string }) => 
      dispatch(createShelf(params)),
    updateShelfMetadata: (params: { shelfId: string, title?: string, description?: string }) => 
      dispatch(updateShelfMetadata(params)),
    rebalanceShelfItems: (params: { shelfId: string, principal: Principal | string }) => 
      dispatch(rebalanceShelfItems(params)),
    createAndAddShelfItem: (params: { 
      parentShelfId: string, 
      title: string, 
      description: string, 
      principal: Principal | string 
    }) => dispatch(createAndAddShelfItem(params)),
    
    // Item management
    addItem: (params: { 
      shelf: Shelf, 
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
    reorderItem: (params: { 
      shelfId: string, 
      itemId: number, 
      referenceItemId: number | null, 
      before: boolean,
      principal: Principal | string
    }) => dispatch(reorderItem(params)),
    reorderProfileShelf: (params: { 
      shelfId: string, 
      referenceShelfId: string | null, 
      before: boolean,
      principal: Principal | string,
      newShelfOrder?: string[]
    }) => dispatch(reorderProfileShelf(params)),
    updateShelfOrder: (newOrder: string[]) => 
      dispatch(updateShelfOrder(newOrder)),
    
    // Collaboration features
    listShelfEditors: (shelfId: string) => 
      dispatch(listShelfEditors(shelfId)),
    addShelfEditor: (params: { shelfId: string, editorPrincipal: string }) => 
      dispatch(addShelfEditor(params)),
    removeShelfEditor: (params: { shelfId: string, editorPrincipal: string }) => 
      dispatch(removeShelfEditor(params)),
  };
}; 