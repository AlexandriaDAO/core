import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { Shelf } from '../../../../../../../declarations/perpetua/perpetua.did';
import { 
  loadShelves, 
  loadRecentShelves 
} from './perpetuaThunks';
import { Draft } from 'immer';

// Define the permissions interfaces
export interface ContentPermissions {
  contentId: string;
  hasEditAccess: boolean;
}

// Define the state interface
export interface PerpetuaState {
  shelves: Shelf[];
  publicShelves: Shelf[];
  selectedShelf: Shelf | null;
  lastTimestamp: string | undefined;  // String representation of BigInt timestamp
  loading: boolean;
  publicLoading: boolean;
  error: string | null;
  // Permissions state
  userPrincipal: string | null;
  permissions: Record<string, boolean>; // Map of contentId -> hasEditAccess (owner OR editor)
  ownerPermissions: Record<string, boolean>; // Map of contentId -> isOwner
  // Editor tracking
  shelfEditors: Record<string, string[]>; // Map of shelfId -> editor principals
  editorsLoading: Record<string, boolean>; // Track loading state for each shelf's editors
  // Profile reordering state
  isProfileReorderMode: boolean;
  profileShelvesOriginal: Shelf[]; // Original shelf order before reordering
  profileReorderLoading: boolean;
}

// Initial state
const initialState: PerpetuaState = {
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
  ownerPermissions: {},
  // Initialize editors state
  shelfEditors: {},
  editorsLoading: {},
  // Initialize profile reordering state
  isProfileReorderMode: false,
  profileShelvesOriginal: [],
  profileReorderLoading: false,
};

// Helper function to update permissions for a shelf
const updateShelfPermissions = (
  state: Draft<PerpetuaState>, 
  shelf: Draft<Shelf> | Shelf, 
  editors: string[] = []
) => {
  if (!state.userPrincipal) return;
  
  const shelfId = shelf.shelf_id;
  const ownerPrincipal = shelf.owner.toString();
  const isOwner = ownerPrincipal === state.userPrincipal;
  const isEditor = editors.some(editor => editor === state.userPrincipal);
  
  // Update both permission types
  state.ownerPermissions[shelfId] = isOwner;
  state.permissions[shelfId] = isOwner || isEditor;
};

// // # REDUCER # // //
const perpetuaSlice = createSlice({
  name: 'perpetua',
  initialState,
  reducers: {
    setSelectedShelf: (state, action: PayloadAction<Shelf | null>) => {
      state.selectedShelf = action.payload;
      
      // Use the helper function for permission updates
      if (action.payload && state.userPrincipal) {
        const shelfId = action.payload.shelf_id;
        const editors = state.shelfEditors[shelfId] || [];
        updateShelfPermissions(state, action.payload, editors);
      }
    },
    setUserPrincipal: (state, action: PayloadAction<string | null>) => {
      state.userPrincipal = action.payload;
      
      // Update all permissions when user changes
      if (action.payload) {
        // Update shelves permissions
        state.shelves.forEach(shelf => {
          const shelfId = shelf.shelf_id;
          const editors = state.shelfEditors[shelfId] || [];
          updateShelfPermissions(state, shelf, editors);
        });
        
        // Update public shelves permissions
        state.publicShelves.forEach(shelf => {
          const shelfId = shelf.shelf_id;
          const editors = state.shelfEditors[shelfId] || [];
          updateShelfPermissions(state, shelf, editors);
        });
        
        // Update selected shelf permission if exists
        if (state.selectedShelf) {
          const shelfId = state.selectedShelf.shelf_id;
          const editors = state.shelfEditors[shelfId] || [];
          updateShelfPermissions(state, state.selectedShelf, editors);
        }
      } else {
        // If user is null, clear all permissions
        state.permissions = {};
        state.ownerPermissions = {};
      }
    },
    setContentPermission: (state, action: PayloadAction<ContentPermissions>) => {
      const { contentId, hasEditAccess } = action.payload;
      state.permissions[contentId] = hasEditAccess;
    },
    // Add a reducer for handling shelf editors
    setShelfEditors: (state, action: PayloadAction<{shelfId: string, editors: string[]}>) => {
      const { shelfId, editors } = action.payload;
      state.shelfEditors[shelfId] = editors;
      
      // Update permissions for this shelf if user is logged in
      if (state.userPrincipal) {
        // Find the shelf in either shelves, publicShelves, or selectedShelf
        let targetShelf: Draft<Shelf> | Shelf | null = null;
        
        const inShelves = state.shelves.find(s => s.shelf_id === shelfId);
        const inPublicShelves = state.publicShelves.find(s => s.shelf_id === shelfId);
        
        if (inShelves) {
          targetShelf = inShelves;
        } else if (inPublicShelves) {
          targetShelf = inPublicShelves;
        } else if (state.selectedShelf && state.selectedShelf.shelf_id === shelfId) {
          targetShelf = state.selectedShelf;
        }
        
        if (targetShelf) {
          updateShelfPermissions(state, targetShelf, editors);
        }
      }
    },
    setEditorsLoading: (state, action: PayloadAction<{shelfId: string, loading: boolean}>) => {
      const { shelfId, loading } = action.payload;
      state.editorsLoading[shelfId] = loading;
    },
    clearPermissions: (state) => {
      state.permissions = {};
      state.ownerPermissions = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    // Update the updateSingleShelf reducer to handle permissions properly
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
        const shelfId = updatedShelf.shelf_id;
        const editors = state.shelfEditors[shelfId] || [];
        updateShelfPermissions(state, updatedShelf, editors);
      }
    },
    // Profile reordering actions
    enterProfileReorderMode: (state) => {
      state.isProfileReorderMode = true;
      // Save the original order of shelves
      state.profileShelvesOriginal = [...state.shelves];
    },
    exitProfileReorderMode: (state) => {
      state.isProfileReorderMode = false;
      // Reset to original order if we exit without saving
      state.shelves = [...state.profileShelvesOriginal];
      state.profileShelvesOriginal = [];
    },
    setProfileReorderLoading: (state, action: PayloadAction<boolean>) => {
      state.profileReorderLoading = action.payload;
    },
    // For local reordering before saving
    reorderShelvesLocal: (state, action: PayloadAction<{dragIndex: number, dropIndex: number}>) => {
      const { dragIndex, dropIndex } = action.payload;
      if (dragIndex === dropIndex) return;
      
      console.log(`Redux: Reordering shelves from ${dragIndex} to ${dropIndex}`);
      
      // Make a copy of the shelves array
      const updatedShelves = [...state.shelves];
      
      // Get the shelf being moved
      const draggedShelf = updatedShelves[dragIndex];
      
      // Remove the dragged shelf
      updatedShelves.splice(dragIndex, 1);
      
      // Insert it at the drop position
      updatedShelves.splice(dropIndex, 0, draggedShelf);
      
      // Debugging
      console.log("New shelf order IDs:", updatedShelves.map(s => s.shelf_id).join(", "));
      
      // Update the shelves array
      state.shelves = updatedShelves;
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
            // Handle both string and Principal object formats for owner
            const ownerStr = typeof shelf.owner === 'string' 
              ? shelf.owner 
              : shelf.owner.toString();
            
            state.permissions[shelf.shelf_id] = ownerStr === state.userPrincipal;
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
            // Handle both string and Principal object formats for owner
            const ownerStr = typeof shelf.owner === 'string' 
              ? shelf.owner 
              : shelf.owner.toString();
            
            state.permissions[shelf.shelf_id] = ownerStr === state.userPrincipal;
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
  clearPermissions,
  setShelfEditors,
  setEditorsLoading,
  // Export new actions
  enterProfileReorderMode,
  exitProfileReorderMode,
  setProfileReorderLoading,
  reorderShelvesLocal
} = perpetuaSlice.actions;
export default perpetuaSlice.reducer;

// Selectors
export const selectShelves = (state: { perpetua: PerpetuaState }) => state.perpetua.shelves;
export const selectPublicShelves = (state: { perpetua: PerpetuaState }) => state.perpetua.publicShelves;
export const selectSelectedShelf = (state: { perpetua: PerpetuaState }) => state.perpetua.selectedShelf;
export const selectLastTimestamp = (state: { perpetua: PerpetuaState }) => state.perpetua.lastTimestamp;

export const selectLoading = (state: { perpetua: PerpetuaState }) => state.perpetua.loading;
export const selectPublicLoading = (state: { perpetua: PerpetuaState }) => state.perpetua.publicLoading;
export const selectError = (state: { perpetua: PerpetuaState }) => state.perpetua.error;

// Permission selectors
export const selectUserPrincipal = (state: { perpetua: PerpetuaState }) => state.perpetua.userPrincipal;
export const selectPermissions = (state: { perpetua: PerpetuaState }) => state.perpetua.permissions;

// New selectors for collaboration features
export const selectShelfEditors = (shelfId: string) => 
  (state: { perpetua: PerpetuaState }) => state.perpetua.shelfEditors[shelfId] || [];

export const selectEditorsLoading = (shelfId: string) => 
  (state: { perpetua: PerpetuaState }) => state.perpetua.editorsLoading[shelfId] || false;

// Check if user is the owner of a shelf
export const selectIsOwner = (contentId: string) => 
  (state: { perpetua: PerpetuaState }) => {
    return state.perpetua.ownerPermissions[contentId] || false;
  };

// Keep existing selectHasEditAccess for general edit permission
export const selectHasEditAccess = (contentId: string) => 
  (state: { perpetua: PerpetuaState }) => {
    return state.perpetua.permissions[contentId] || false;
  };

// Add selectors for profile reordering state
export const selectIsProfileReorderMode = (state: { perpetua: PerpetuaState }) => state.perpetua.isProfileReorderMode;
export const selectProfileReorderLoading = (state: { perpetua: PerpetuaState }) => state.perpetua.profileReorderLoading;