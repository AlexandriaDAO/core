import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Shelf } from '@/../../declarations/perpetua/perpetua.did';
import { 
  loadShelves, 
  loadRecentShelves,
  loadMissingShelves
} from './thunks/queryThunks';

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
    shelfItems: Record<string, number[]>; // Map of shelfId -> ordered itemIds
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
    shelfItems: {},
  },
  selectedShelfId: null,
  lastTimestamp: undefined,
  loading: {
    userShelves: false,
    publicShelves: false,
    editors: {},
  },
  error: null,
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
    },
    setContentPermission: (state, action: PayloadAction<ContentPermissions>) => {
      // This is now handled via selectors - can be removed if not used elsewhere
    },
    // Add a reducer for handling shelf editors
    setShelfEditors: (state, action: PayloadAction<{shelfId: string, editors: string[]}>) => {
      const { shelfId, editors } = action.payload;
      state.shelfEditors[shelfId] = editors;
    },
    setEditorsLoading: (state, action: PayloadAction<{shelfId: string, loading: boolean}>) => {
      const { shelfId, loading } = action.payload;
      state.loading.editors[shelfId] = loading;
    },
    clearPermissions: (state) => {
      // This is now handled via selectors - can be removed if not used elsewhere
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
    },
    // Update the order of user shelves
    updateShelfOrder: (state, action: PayloadAction<string[]>) => {
      // The payload is the new ordered array of shelf IDs
      state.ids.userShelves = action.payload;
    },
    // Update the order of items within a shelf
    updateItemOrder: (state, action: PayloadAction<{shelfId: string, itemIds: number[]}>) => {
      const { shelfId, itemIds } = action.payload;
      // Store the new order in the shelfItems map
      state.ids.shelfItems[shelfId] = itemIds;
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
        const shelves = action.payload;
        const { entities, ids } = normalizeShelves(shelves);
        
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
  setContentPermission,
  clearPermissions,
  setShelfEditors,
  setEditorsLoading,
  updateShelfOrder,
  updateItemOrder
} = perpetuaSlice.actions;
export default perpetuaSlice.reducer;

// Selector memoization cache
const selectorCache: {
  shelfById: Record<string, ReturnType<typeof createSelector>>;
  shelfEditors: Record<string, ReturnType<typeof createSelector>>;
  editorsLoading: Record<string, ReturnType<typeof createSelector>>;
  hasEditAccess: Record<string, ReturnType<typeof createSelector>>;
  isOwner: Record<string, ReturnType<typeof createSelector>>;
  isEditor: Record<string, ReturnType<typeof createSelector>>;
  optimisticShelfItemOrder: Record<string, ReturnType<typeof createSelector>>;
} = {
  shelfById: {},
  shelfEditors: {},
  editorsLoading: {},
  hasEditAccess: {},
  isOwner: {},
  isEditor: {},
  optimisticShelfItemOrder: {},
};

// Selectors
// Get the order of user shelves directly from state - memoized to prevent recalculation
export const selectOptimisticShelfOrder = createSelector(
  (state: RootState) => state.perpetua.ids.userShelves,
  (userShelves) => userShelves
);

// Get all user shelves with preserved order - memoized to prevent recalculation
export const selectUserShelves = createSelector(
  selectOptimisticShelfOrder,
  (state: RootState) => state.perpetua.entities.shelves,
  (shelfOrder, shelves) => shelfOrder.map(id => shelves[id]).filter(Boolean)
);

// Get all public shelves with preserved order - memoized to prevent recalculation
export const selectPublicShelves = createSelector(
  (state: RootState) => state.perpetua.ids.publicShelves,
  (state: RootState) => state.perpetua.entities.shelves,
  (publicShelves, shelves) => publicShelves.map(id => shelves[id]).filter(Boolean)
);

// Get a specific shelf by ID - memoized factory selector with caching
export const selectShelfById = (shelfId: string) => {
  if (!selectorCache.shelfById[shelfId]) {
    selectorCache.shelfById[shelfId] = createSelector(
      (state: RootState) => state.perpetua.entities.shelves[shelfId],
      (shelf) => shelf || null
    );
  }
  return selectorCache.shelfById[shelfId];
};

// Get the currently selected shelf - memoized to prevent recalculation
export const selectSelectedShelf = createSelector(
  (state: RootState) => state.perpetua.selectedShelfId,
  (state: RootState) => state.perpetua.entities.shelves,
  (selectedShelfId, shelves) => {
    if (!selectedShelfId) return null;
    return shelves[selectedShelfId] || null;
  }
);

// Get the optimistically updated ordered item IDs for a shelf - memoized factory selector with caching
export const selectOptimisticShelfItemOrder = (shelfId: string) => {
  if (!selectorCache.optimisticShelfItemOrder[shelfId]) {
    selectorCache.optimisticShelfItemOrder[shelfId] = createSelector(
      (state: RootState) => state.perpetua.ids.shelfItems[shelfId],
      (itemIds) => itemIds || []
    );
  }
  return selectorCache.optimisticShelfItemOrder[shelfId];
};

// Remaining selectors, also memoized
export const selectLastTimestamp = createSelector(
  (state: RootState) => state.perpetua.lastTimestamp,
  (timestamp) => timestamp
);

export const selectLoading = createSelector(
  (state: RootState) => state.perpetua.loading.userShelves,
  (loading) => loading
);

export const selectPublicLoading = createSelector(
  (state: RootState) => state.perpetua.loading.publicShelves,
  (loading) => loading
);

export const selectError = createSelector(
  (state: RootState) => state.perpetua.error,
  (error) => error
);

// New selectors for collaboration features with caching
export const selectShelfEditors = (shelfId: string) => {
  if (!selectorCache.shelfEditors[shelfId]) {
    selectorCache.shelfEditors[shelfId] = createSelector(
      (state: RootState) => state.perpetua.shelfEditors[shelfId],
      (editors) => editors || []
    );
  }
  return selectorCache.shelfEditors[shelfId];
};

export const selectEditorsLoading = (shelfId: string) => {
  if (!selectorCache.editorsLoading[shelfId]) {
    selectorCache.editorsLoading[shelfId] = createSelector(
      (state: RootState) => state.perpetua.loading.editors[shelfId],
      (loading) => loading || false
    );
  }
  return selectorCache.editorsLoading[shelfId];
};

// Check if user has edit access to a content item - with caching
export const selectHasEditAccess = (contentId: string) => {
  if (!selectorCache.hasEditAccess[contentId]) {
    selectorCache.hasEditAccess[contentId] = createSelector(
      (state: RootState) => state.auth.user?.principal,
      (state: RootState) => state.perpetua.entities.shelves[contentId],
      (state: RootState) => state.perpetua.shelfEditors[contentId] || [],
      (userPrincipal, shelf, editors) => {
        if (!userPrincipal || !shelf) return false;
        
        // Check if user is owner
        if (shelf.owner === userPrincipal) return true;
        
        // Check if user is editor
        return editors.includes(userPrincipal);
      }
    );
  }
  return selectorCache.hasEditAccess[contentId];
};

// Check if user is the owner of a shelf - with caching
export const selectIsOwner = (contentId: string) => {
  if (!selectorCache.isOwner[contentId]) {
    selectorCache.isOwner[contentId] = createSelector(
      (state: RootState) => state.auth.user?.principal,
      (state: RootState) => state.perpetua.entities.shelves[contentId],
      (userPrincipal, shelf) => {
        if (!shelf || !userPrincipal) return false;
        return shelf.owner === userPrincipal;
      }
    );
  }
  return selectorCache.isOwner[contentId];
};

// Check if user is an editor (but not owner) of a shelf - with caching
export const selectIsEditor = (contentId: string) => {
  if (!selectorCache.isEditor[contentId]) {
    selectorCache.isEditor[contentId] = createSelector(
      (state: RootState) => state.auth.user?.principal,
      (state: RootState) => state.perpetua.entities.shelves[contentId],
      (state: RootState) => state.perpetua.shelfEditors[contentId] || [],
      (userPrincipal, shelf, editors) => {
        if (!userPrincipal || !shelf) return false;
        
        // If user is owner, they're not just an editor
        if (shelf.owner === userPrincipal) return false;
        
        return editors.includes(userPrincipal);
      }
    );
  }
  return selectorCache.isEditor[contentId];
};