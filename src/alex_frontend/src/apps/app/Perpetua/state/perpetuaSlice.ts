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

// Create reusable input selectors to improve memoization
const selectPerpetuaState = (state: RootState) => state.perpetua;
const selectShelvesEntities = (state: RootState) => state.perpetua.entities.shelves;
const selectUserPrincipal = (state: RootState) => state.auth.user?.principal;
const selectShelfEditorsByIdMap = (state: RootState) => state.perpetua.shelfEditors;
const selectEditorsLoadingMap = (state: RootState) => state.perpetua.loading.editors;
const selectShelfItemOrderMap = (state: RootState) => state.perpetua.ids.shelfItems;
const selectUserShelvesOrder = (state: RootState) => state.perpetua.ids.userShelves;
const selectPublicShelvesOrder = (state: RootState) => state.perpetua.ids.publicShelves;
const selectSelectedShelfId = (state: RootState) => state.perpetua.selectedShelfId;
const selectLastTime = (state: RootState) => state.perpetua.lastTimestamp;
const selectUserShelvesLoading = (state: RootState) => state.perpetua.loading.userShelves;
const selectPublicShelvesLoading = (state: RootState) => state.perpetua.loading.publicShelves;
const selectPerpetuaError = (state: RootState) => state.perpetua.error;

// Enhanced selector caching mechanism
// This stores actual selector instances instead of creating new ones each time
const memoizedSelectorsByShelfId = {
  shelfById: new Map<string, ReturnType<typeof createSelector>>(),
  shelfEditors: new Map<string, ReturnType<typeof createSelector>>(),
  editorsLoading: new Map<string, ReturnType<typeof createSelector>>(),
  hasEditAccess: new Map<string, ReturnType<typeof createSelector>>(),
  isOwner: new Map<string, ReturnType<typeof createSelector>>(),
  isEditor: new Map<string, ReturnType<typeof createSelector>>(),
  optimisticShelfItemOrder: new Map<string, ReturnType<typeof createSelector>>(),
};

// Selectors
// Get the order of user shelves directly from state - memoized to prevent recalculation
export const selectOptimisticShelfOrder = createSelector(
  (state: RootState) => state.perpetua.ids.userShelves,
  (userShelves) => userShelves // Return direct reference from state
);

// Get all user shelves with preserved order - memoized to prevent recalculation
export const selectUserShelves = createSelector(
  selectOptimisticShelfOrder,
  selectShelvesEntities,
  (shelfOrder, shelves) => shelfOrder.map(id => shelves[id]).filter(Boolean)
);

// Get all public shelves with preserved order - memoized to prevent recalculation
export const selectPublicShelves = createSelector(
  (state: RootState) => state.perpetua.ids.publicShelves,
  selectShelvesEntities,
  (publicShelves, shelves) => publicShelves.map(id => shelves[id]).filter(Boolean)
);

// Get a specific shelf by ID - memoized factory selector with improved caching
export const selectShelfById = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.shelfById.has(shelfId)) {
    const selector = createSelector(
      selectShelvesEntities,
      (shelves) => shelves[shelfId] || null
    );
    memoizedSelectorsByShelfId.shelfById.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.shelfById.get(shelfId)!;
};

// Get the currently selected shelf - memoized to prevent recalculation
export const selectSelectedShelf = createSelector(
  selectSelectedShelfId,
  selectShelvesEntities,
  (selectedShelfId, shelves) => {
    if (!selectedShelfId) return null;
    return shelves[selectedShelfId] || null;
  }
);

// Get the optimistically updated ordered item IDs for a shelf - memoized factory selector with improved caching
export const selectOptimisticShelfItemOrder = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.optimisticShelfItemOrder.has(shelfId)) {
    const selector = createSelector(
      selectShelfItemOrderMap,
      (itemOrderMap) => itemOrderMap[shelfId] || [] // Return direct reference from state
    );
    memoizedSelectorsByShelfId.optimisticShelfItemOrder.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.optimisticShelfItemOrder.get(shelfId)!;
};

// Remaining selectors, also memoized
export const selectLastTimestamp = createSelector(
  selectLastTime,
  (timestamp) => timestamp ? String(timestamp) : undefined // Ensure transformation
);

export const selectLoading = createSelector(
  selectUserShelvesLoading,
  (loading) => Boolean(loading) // Transform to boolean
);

export const selectPublicLoading = createSelector(
  selectPublicShelvesLoading,
  (loading) => Boolean(loading) // Transform to boolean
);

export const selectError = createSelector(
  selectPerpetuaError,
  (error) => error || null // Ensure null if undefined
);

// Improved selectors for collaboration features with better caching
export const selectShelfEditors = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.shelfEditors.has(shelfId)) {
    const selector = createSelector(
      selectShelfEditorsByIdMap,
      (editorsMap) => editorsMap[shelfId] || [] // Return direct reference from state
    );
    memoizedSelectorsByShelfId.shelfEditors.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.shelfEditors.get(shelfId)!;
};

export const selectEditorsLoading = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.editorsLoading.has(shelfId)) {
    const selector = createSelector(
      selectEditorsLoadingMap,
      (loadingMap) => Boolean(loadingMap[shelfId]) // Transform to boolean
    );
    memoizedSelectorsByShelfId.editorsLoading.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.editorsLoading.get(shelfId)!;
};

// Check if user has edit access to a content item - with improved caching
export const selectHasEditAccess = (contentId: string) => {
  if (!memoizedSelectorsByShelfId.hasEditAccess.has(contentId)) {
    const selector = createSelector(
      selectUserPrincipal,
      (state: RootState) => selectShelvesEntities(state)[contentId],
      (state: RootState) => selectShelfEditorsByIdMap(state)[contentId] || [],
      (userPrincipal, shelf, editors) => {
        if (!userPrincipal || !shelf) return false;
        
        // Check if user is owner
        if (shelf.owner === userPrincipal) return true;
        
        // Check if user is editor
        return editors.includes(userPrincipal);
      }
    );
    memoizedSelectorsByShelfId.hasEditAccess.set(contentId, selector);
  }
  return memoizedSelectorsByShelfId.hasEditAccess.get(contentId)!;
};

// Check if user is the owner of a shelf - with improved caching
export const selectIsOwner = (contentId: string) => {
  if (!memoizedSelectorsByShelfId.isOwner.has(contentId)) {
    const selector = createSelector(
      selectUserPrincipal,
      (state: RootState) => selectShelvesEntities(state)[contentId],
      (userPrincipal, shelf) => {
        if (!shelf || !userPrincipal) return false;
        return shelf.owner === userPrincipal;
      }
    );
    memoizedSelectorsByShelfId.isOwner.set(contentId, selector);
  }
  return memoizedSelectorsByShelfId.isOwner.get(contentId)!;
};

// Check if user is an editor (but not owner) of a shelf - with improved caching
export const selectIsEditor = (contentId: string) => {
  if (!memoizedSelectorsByShelfId.isEditor.has(contentId)) {
    const selector = createSelector(
      selectUserPrincipal,
      (state: RootState) => selectShelvesEntities(state)[contentId],
      (state: RootState) => selectShelfEditorsByIdMap(state)[contentId] || [],
      (userPrincipal, shelf, editors) => {
        if (!userPrincipal || !shelf) return false;
        
        // If user is owner, they're not just an editor
        if (shelf.owner === userPrincipal) return false;
        
        return editors.includes(userPrincipal);
      }
    );
    memoizedSelectorsByShelfId.isEditor.set(contentId, selector);
  }
  return memoizedSelectorsByShelfId.isEditor.get(contentId)!;
};