import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { Shelf } from '@/../../declarations/perpetua/perpetua.did';
import { 
  loadShelves, 
  loadRecentShelves,
  loadMissingShelves
} from './thunks/queryThunks';
import { Draft } from 'immer';

// Define the permissions interfaces
export interface ContentPermissions {
  contentId: string;
  hasEditAccess: boolean;
}

// Normalized shelf interface
export interface NormalizedShelf extends Omit<Shelf, 'owner'> {
  owner: string; // Always store owner as string for consistency
}

// Define the state interface with normalized structure
export interface PerpetuaState {
  // Normalized entities
  entities: {
    shelves: Record<string, NormalizedShelf>; // Map of shelfId -> shelf
  };
  // IDs for different views
  ids: {
    userShelves: string[]; // IDs of user's shelves (order preserved)
    publicShelves: string[]; // IDs of public shelves (order preserved)
  };
  // References
  selectedShelfId: string | null;
  lastTimestamp: string | undefined;  // String representation of BigInt timestamp
  // Loading states
  loading: {
    userShelves: boolean;
    publicShelves: boolean;
    editors: Record<string, boolean>; // Track loading state for each shelf's editors
  };
  error: string | null;
  // Permissions state
  userPrincipal: string | null;
  permissions: Record<string, boolean>; // Map of contentId -> hasEditAccess (owner OR editor)
  ownerPermissions: Record<string, boolean>; // Map of contentId -> isOwner
  // Editor tracking
  shelfEditors: Record<string, string[]>; // Map of shelfId -> editor principals
}

// Initial state
const initialState: PerpetuaState = {
  entities: {
    shelves: {},
  },
  ids: {
    userShelves: [],
    publicShelves: [],
  },
  selectedShelfId: null,
  lastTimestamp: undefined,
  loading: {
    userShelves: false,
    publicShelves: false,
    editors: {},
  },
  error: null,
  userPrincipal: null,
  permissions: {},
  ownerPermissions: {},
  shelfEditors: {},
};

// Utility function to normalize a shelf
const normalizeShelf = (shelf: Shelf): NormalizedShelf => {
  return {
    ...shelf,
    owner: typeof shelf.owner === 'string' ? shelf.owner : shelf.owner.toString()
  };
};

// Utility function to normalize multiple shelves and return entities and ids
const normalizeShelves = (shelves: Shelf[]): { 
  entities: Record<string, NormalizedShelf>; 
  ids: string[];
} => {
  const entities: Record<string, NormalizedShelf> = {};
  const ids: string[] = [];
  
  shelves.forEach(shelf => {
    const normalizedShelf = normalizeShelf(shelf);
    const shelfId = shelf.shelf_id;
    entities[shelfId] = normalizedShelf;
    ids.push(shelfId);
  });
  
  return { entities, ids };
};

// Helper function to update permissions for a shelf
const updateShelfPermissions = (
  state: Draft<PerpetuaState>, 
  shelfId: string,
  editors: string[] = []
) => {
  if (!state.userPrincipal) return;
  
  const shelf = state.entities.shelves[shelfId];
  if (!shelf) return;
  
  const ownerPrincipal = shelf.owner;
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
    setSelectedShelf: (state, action: PayloadAction<Shelf | string | null>) => {
      if (action.payload === null) {
        state.selectedShelfId = null;
        return;
      }
      
      // Handle either a shelf object or a shelf ID string
      if (typeof action.payload === 'string') {
        state.selectedShelfId = action.payload;
      } else {
        const shelf = normalizeShelf(action.payload);
        const shelfId = shelf.shelf_id;
        
        // Add/update the shelf in our entities
        state.entities.shelves[shelfId] = shelf;
        state.selectedShelfId = shelfId;
      }
      
      // Update permissions if we have the shelf and user is logged in
      if (state.selectedShelfId && state.userPrincipal) {
        const shelfId = state.selectedShelfId;
        const editors = state.shelfEditors[shelfId] || [];
        updateShelfPermissions(state, shelfId, editors);
      }
    },
    setUserPrincipal: (state, action: PayloadAction<string | null>) => {
      state.userPrincipal = action.payload;
      
      // If user is null, clear all permissions
      if (!action.payload) {
        state.permissions = {};
        state.ownerPermissions = {};
        return;
      }
      
      // Update all permissions when user changes
      // For all shelves in our entities
      Object.keys(state.entities.shelves).forEach(shelfId => {
        const editors = state.shelfEditors[shelfId] || [];
        updateShelfPermissions(state, shelfId, editors);
      });
    },
    setContentPermission: (state, action: PayloadAction<ContentPermissions>) => {
      const { contentId, hasEditAccess } = action.payload;
      state.permissions[contentId] = hasEditAccess;
    },
    // Add a reducer for handling shelf editors
    setShelfEditors: (state, action: PayloadAction<{shelfId: string, editors: string[]}>) => {
      const { shelfId, editors } = action.payload;
      state.shelfEditors[shelfId] = editors;
      
      // Update permissions for this shelf if user is logged in and the shelf exists in our entities
      if (state.userPrincipal && state.entities.shelves[shelfId]) {
        updateShelfPermissions(state, shelfId, editors);
      }
    },
    setEditorsLoading: (state, action: PayloadAction<{shelfId: string, loading: boolean}>) => {
      const { shelfId, loading } = action.payload;
      state.loading.editors[shelfId] = loading;
    },
    clearPermissions: (state) => {
      state.permissions = {};
      state.ownerPermissions = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    // Update a single shelf in the normalized store
    updateSingleShelf: (state, action: PayloadAction<Shelf>) => {
      const shelf = normalizeShelf(action.payload);
      const shelfId = shelf.shelf_id;
      
      // Update in entities
      state.entities.shelves[shelfId] = shelf;
      
      // Update permissions for this shelf
      if (state.userPrincipal) {
        const editors = state.shelfEditors[shelfId] || [];
        updateShelfPermissions(state, shelfId, editors);
      }
    },
    // Update the order of user shelves
    updateShelfOrder: (state, action: PayloadAction<string[]>) => {
      // The payload is the new ordered array of shelf IDs
      state.ids.userShelves = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load shelves
      .addCase(loadShelves.pending, (state) => {
        state.loading.userShelves = true;
        state.error = null;
      })
      .addCase(loadShelves.fulfilled, (state, action) => {
        const { entities, ids } = normalizeShelves(action.payload);
        
        // Update entities by merging new shelves
        state.entities.shelves = {
          ...state.entities.shelves,
          ...entities
        };
        
        // Preserve existing order if we have one
        if (state.ids.userShelves.length > 0) {
          // First, keep all existing shelves that still exist in new data
          const existingOrder = state.ids.userShelves.filter(id => entities[id]);
          
          // Then add any new shelves that weren't already in our existing order
          const newShelfIds = ids.filter(id => !existingOrder.includes(id));
          
          // Combine existing (preserved order) with new shelves
          state.ids.userShelves = [...existingOrder, ...newShelfIds];
        } else {
          // If no existing order, use the order from the API
          state.ids.userShelves = ids;
        }
        
        state.loading.userShelves = false;
        
        // Update permissions for loaded shelves
        if (state.userPrincipal) {
          ids.forEach(shelfId => {
            const editors = state.shelfEditors[shelfId] || [];
            updateShelfPermissions(state, shelfId, editors);
          });
        }
      })
      .addCase(loadShelves.rejected, (state, action) => {
        state.loading.userShelves = false;
        state.error = action.payload as string;
      })
      
      // Handle loadMissingShelves (new)
      .addCase(loadMissingShelves.pending, (state) => {
        state.loading.userShelves = true;
        state.error = null;
      })
      .addCase(loadMissingShelves.fulfilled, (state, action) => {
        // Only add new shelves that don't exist yet
        if (action.payload.length === 0) {
          // No missing shelves, nothing to do
          state.loading.userShelves = false;
          return;
        }
        
        const { entities, ids } = normalizeShelves(action.payload);
        
        // Update entities by merging new shelves
        state.entities.shelves = {
          ...state.entities.shelves,
          ...entities
        };
        
        // Only add new shelf IDs that aren't already in our order
        const newShelfIds = ids.filter(id => !state.ids.userShelves.includes(id));
        
        // Append any new shelves to the existing order
        if (newShelfIds.length > 0) {
          state.ids.userShelves = [...state.ids.userShelves, ...newShelfIds];
        }
        
        state.loading.userShelves = false;
        
        // Update permissions for new shelves
        if (state.userPrincipal) {
          ids.forEach(shelfId => {
            const editors = state.shelfEditors[shelfId] || [];
            updateShelfPermissions(state, shelfId, editors);
          });
        }
      })
      .addCase(loadMissingShelves.rejected, (state, action) => {
        state.loading.userShelves = false;
        state.error = action.payload as string;
      })
      
      // Load recent public shelves
      .addCase(loadRecentShelves.pending, (state) => {
        state.loading.publicShelves = true;
        state.error = null;
      })
      .addCase(loadRecentShelves.fulfilled, (state, action) => {
        const { shelves, beforeTimestamp, lastTimestamp } = action.payload;
        const { entities, ids } = normalizeShelves(shelves);
        
        // Merge new entities
        state.entities.shelves = {
          ...state.entities.shelves,
          ...entities
        };
        
        // If we're loading with a timestamp, append to existing public shelf IDs
        if (beforeTimestamp) {
          state.ids.publicShelves = [...state.ids.publicShelves, ...ids];
        } else {
          // Otherwise, replace the public shelf IDs
          state.ids.publicShelves = ids;
        }
        
        // Store the lastTimestamp as a string (already converted in the thunk)
        state.lastTimestamp = lastTimestamp;
        state.loading.publicShelves = false;
        
        // Update permissions for loaded public shelves
        if (state.userPrincipal) {
          ids.forEach(shelfId => {
            const editors = state.shelfEditors[shelfId] || [];
            updateShelfPermissions(state, shelfId, editors);
          });
        }
      })
      .addCase(loadRecentShelves.rejected, (state, action) => {
        state.loading.publicShelves = false;
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
  updateShelfOrder
} = perpetuaSlice.actions;
export default perpetuaSlice.reducer;

// Selectors
// Get all user shelves with preserved order
export const selectUserShelves = (state: { perpetua: PerpetuaState }) => {
  return state.perpetua.ids.userShelves.map(id => state.perpetua.entities.shelves[id]).filter(Boolean);
};

// Get all public shelves with preserved order
export const selectPublicShelves = (state: { perpetua: PerpetuaState }) => {
  return state.perpetua.ids.publicShelves.map(id => state.perpetua.entities.shelves[id]).filter(Boolean);
};

// Get a specific shelf by ID
export const selectShelfById = (shelfId: string) => 
  (state: { perpetua: PerpetuaState }) => state.perpetua.entities.shelves[shelfId] || null;

// Get the currently selected shelf
export const selectSelectedShelf = (state: { perpetua: PerpetuaState }) => {
  const { selectedShelfId } = state.perpetua;
  if (!selectedShelfId) return null;
  return state.perpetua.entities.shelves[selectedShelfId] || null;
};

export const selectLastTimestamp = (state: { perpetua: PerpetuaState }) => state.perpetua.lastTimestamp;

export const selectLoading = (state: { perpetua: PerpetuaState }) => state.perpetua.loading.userShelves;
export const selectPublicLoading = (state: { perpetua: PerpetuaState }) => state.perpetua.loading.publicShelves;
export const selectError = (state: { perpetua: PerpetuaState }) => state.perpetua.error;

// Permission selectors
export const selectUserPrincipal = (state: { perpetua: PerpetuaState }) => state.perpetua.userPrincipal;
export const selectPermissions = (state: { perpetua: PerpetuaState }) => state.perpetua.permissions;

// New selectors for collaboration features
export const selectShelfEditors = (shelfId: string) => 
  (state: { perpetua: PerpetuaState }) => state.perpetua.shelfEditors[shelfId] || [];

export const selectEditorsLoading = (shelfId: string) => 
  (state: { perpetua: PerpetuaState }) => state.perpetua.loading.editors[shelfId] || false;

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