import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { Shelf } from '../../../../../../../declarations/lexigraph/lexigraph.did';
import { 
  loadShelves, 
  loadRecentShelves 
} from './lexigraphThunks';

// Define the permissions interfaces
export interface ContentPermissions {
  contentId: string;
  hasEditAccess: boolean;
}

// Define the state interface
export interface LexigraphState {
  shelves: Shelf[];
  publicShelves: Shelf[];
  selectedShelf: Shelf | null;
  lastTimestamp: string | undefined;  // String representation of BigInt timestamp
  loading: boolean;
  publicLoading: boolean;
  error: string | null;
  // New permissions state
  userPrincipal: string | null;
  permissions: Record<string, boolean>; // Map of contentId -> hasEditAccess
}

// Initial state
const initialState: LexigraphState = {
  shelves: [],
  publicShelves: [],
  selectedShelf: null,
  lastTimestamp: undefined,
  loading: false,
  publicLoading: false,
  error: null,
  // Initialize permissions state
  userPrincipal: null,
  permissions: {},
};

// // # REDUCER # // //
const lexigraphSlice = createSlice({
  name: 'lexigraph',
  initialState,
  reducers: {
    setSelectedShelf: (state, action: PayloadAction<Shelf | null>) => {
      state.selectedShelf = action.payload;
      
      // Automatically update edit permissions when selected shelf changes
      if (action.payload && state.userPrincipal) {
        const shelfId = action.payload.shelf_id;
        const ownerPrincipal = action.payload.owner.toString();
        state.permissions[shelfId] = ownerPrincipal === state.userPrincipal;
      }
    },
    setUserPrincipal: (state, action: PayloadAction<string | null>) => {
      state.userPrincipal = action.payload;
      
      // Update all permissions when user changes
      if (action.payload) {
        // Update shelves permissions
        state.shelves.forEach(shelf => {
          const shelfId = shelf.shelf_id;
          state.permissions[shelfId] = shelf.owner.toString() === action.payload;
        });
        
        // Update public shelves permissions
        state.publicShelves.forEach(shelf => {
          const shelfId = shelf.shelf_id;
          state.permissions[shelfId] = shelf.owner.toString() === action.payload;
        });
        
        // Update selected shelf permission if exists
        if (state.selectedShelf) {
          const shelfId = state.selectedShelf.shelf_id;
          state.permissions[shelfId] = state.selectedShelf.owner.toString() === action.payload;
        }
      } else {
        // If user is null, clear all permissions
        state.permissions = {};
      }
    },
    setContentPermission: (state, action: PayloadAction<ContentPermissions>) => {
      const { contentId, hasEditAccess } = action.payload;
      state.permissions[contentId] = hasEditAccess;
    },
    clearPermissions: (state) => {
      state.permissions = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add a reducer for updating a single shelf
    updateSingleShelf: (state, action: PayloadAction<Shelf>) => {
      const updatedShelf = action.payload;
      
      // Update in shelves array
      const index = state.shelves.findIndex(shelf => shelf.shelf_id === updatedShelf.shelf_id);
      if (index !== -1) {
        state.shelves[index] = updatedShelf;
      }
      
      // Update in publicShelves if present
      const publicIndex = state.publicShelves.findIndex(shelf => shelf.shelf_id === updatedShelf.shelf_id);
      if (publicIndex !== -1) {
        state.publicShelves[publicIndex] = updatedShelf;
      }
      
      // Update selected shelf if it's the same one
      if (state.selectedShelf && state.selectedShelf.shelf_id === updatedShelf.shelf_id) {
        state.selectedShelf = updatedShelf;
      }
      
      // Update permissions for this shelf
      if (state.userPrincipal) {
        state.permissions[updatedShelf.shelf_id] = updatedShelf.owner.toString() === state.userPrincipal;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load shelves
      .addCase(loadShelves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadShelves.fulfilled, (state, action) => {
        state.shelves = action.payload;
        state.loading = false;
        
        // Update permissions for loaded shelves
        if (state.userPrincipal) {
          action.payload.forEach((shelf: Shelf) => {
            state.permissions[shelf.shelf_id] = shelf.owner.toString() === state.userPrincipal;
          });
        }
      })
      .addCase(loadShelves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Load recent public shelves
      .addCase(loadRecentShelves.pending, (state) => {
        state.publicLoading = true;
        state.error = null;
      })
      .addCase(loadRecentShelves.fulfilled, (state, action) => {
        const { shelves, beforeTimestamp, lastTimestamp } = action.payload;
        
        // If we're loading with a timestamp, append to existing shelves
        if (beforeTimestamp) {
          state.publicShelves = [...state.publicShelves, ...shelves];
        } else {
          // Otherwise, replace the shelves
          state.publicShelves = shelves;
        }
        
        // Store the lastTimestamp as a string (already converted in the thunk)
        state.lastTimestamp = lastTimestamp;
        state.publicLoading = false;
        
        // Update permissions for loaded public shelves
        if (state.userPrincipal) {
          shelves.forEach((shelf: Shelf) => {
            state.permissions[shelf.shelf_id] = shelf.owner.toString() === state.userPrincipal;
          });
        }
      })
      .addCase(loadRecentShelves.rejected, (state, action) => {
        state.publicLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { 
  setSelectedShelf, 
  clearError, 
  updateSingleShelf,
  setUserPrincipal,
  setContentPermission,
  clearPermissions
} = lexigraphSlice.actions;
export default lexigraphSlice.reducer;

// Selectors
export const selectShelves = (state: { lexigraph: LexigraphState }) => state.lexigraph.shelves;
export const selectPublicShelves = (state: { lexigraph: LexigraphState }) => state.lexigraph.publicShelves;
export const selectSelectedShelf = (state: { lexigraph: LexigraphState }) => state.lexigraph.selectedShelf;
export const selectLastTimestamp = (state: { lexigraph: LexigraphState }) => state.lexigraph.lastTimestamp;

export const selectLoading = (state: { lexigraph: LexigraphState }) => state.lexigraph.loading;
export const selectPublicLoading = (state: { lexigraph: LexigraphState }) => state.lexigraph.publicLoading;
export const selectError = (state: { lexigraph: LexigraphState }) => state.lexigraph.error;

// Permission selectors
export const selectUserPrincipal = (state: { lexigraph: LexigraphState }) => state.lexigraph.userPrincipal;
export const selectPermissions = (state: { lexigraph: LexigraphState }) => state.lexigraph.permissions;

// Helper selector to get edit access for a specific content
export const selectHasEditAccess = (contentId: string) => 
  (state: { lexigraph: LexigraphState }) => {
    return state.lexigraph.permissions[contentId] || false;
  };