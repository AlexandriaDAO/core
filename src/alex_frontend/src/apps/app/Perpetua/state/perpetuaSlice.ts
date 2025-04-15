import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Shelf } from '@/../../declarations/perpetua/perpetua.did';
import { 
  loadShelves, 
  loadRecentShelves,
  loadMissingShelves,
  getShelfById
} from './thunks/queryThunks';
import {
  createShelf,
  updateShelfMetadata,
  createAndAddShelfItem
} from './thunks/shelfThunks';
import {
  addItem,
  removeItem
} from './thunks/itemThunks';
import {
  reorderProfileShelf
} from './thunks/reorderThunks';
import {
  listShelfEditors,
  addShelfEditor,
  removeShelfEditor
} from './thunks/collaborationThunks';
import {
  checkShelfPublicAccess,
  toggleShelfPublicAccess
} from './thunks/publicAccessThunks';
import {
  setItemOrder
} from './thunks/reorderThunks';

// Import tag thunks
import {
  fetchPopularTags,
  fetchShelvesByTag,
  fetchTagShelfCount,
  fetchTagsWithPrefix
} from './thunks/queryThunks'; // Corrected path

// TODO: Import tag thunks once created
// import {
//   fetchPopularTags,
//   fetchShelvesByTag,
//   fetchTagShelfCount,
//   fetchTagsWithPrefix
// } from './thunks/tagThunks'; // Placeholder

import { Principal } from '@dfinity/principal'; // Import Principal

// Define the permissions interfaces
export interface ContentPermissions {
  contentId: string;
  hasEditAccess: boolean;
}

// Normalized shelf interface - Export this type
export interface NormalizedShelf extends Omit<Shelf, 'owner'> {
  owner: string; // Always store owner as string for consistency
  is_public: boolean; // Add is_public field to match the backend
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
    shelvesByTag: Record<string, string[]>; // Map of tag -> shelf IDs
  };
  // References
  selectedShelfId: string | null;
  lastTimestamp: string | undefined;  // String representation of BigInt timestamp
  currentTagFilter: string | null; // Currently active tag filter
  // Tag data
  popularTags: string[];
  tagSearchResults: string[];
  tagShelfCounts: Record<string, number>; // Map of tag -> count
  // Loading states
  loading: {
    userShelves: boolean;
    publicShelves: boolean;
    editors: Record<string, boolean>; // Track loading state for each shelf's editors
    publicAccess: Record<string, boolean>; // Track loading state for public access checks
    popularTags: boolean;
    shelvesByTag: boolean;
    tagSearch: boolean;
    tagCounts: boolean;
  };
  error: string | null;
  // Editor tracking
  shelfEditors: Record<string, string[]>; // Map of shelfId -> editor principals
  // Public access tracking
  publicShelfAccess: Record<string, boolean>; // Map of shelfId -> isPublic
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
    shelvesByTag: {},
  },
  selectedShelfId: null,
  lastTimestamp: undefined,
  currentTagFilter: null,
  popularTags: [],
  tagSearchResults: [],
  tagShelfCounts: {},
  loading: {
    userShelves: false,
    publicShelves: false,
    editors: {},
    publicAccess: {},
    popularTags: false,
    shelvesByTag: false,
    tagSearch: false,
    tagCounts: false,
  },
  error: null,
  shelfEditors: {},
  publicShelfAccess: {},
};

// Utility function to normalize a shelf
const normalizeShelf = (shelf: Shelf): NormalizedShelf => {
  return {
    ...shelf,
    owner: typeof shelf.owner === 'string' ? shelf.owner : shelf.owner.toString(),
    is_public: typeof shelf.is_public === 'boolean' ? shelf.is_public : false
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
    // Add a reducer for handling shelf public access
    setShelfPublicAccess: (state, action: PayloadAction<{shelfId: string, isPublic: boolean}>) => {
      const { shelfId, isPublic } = action.payload;
      state.publicShelfAccess[shelfId] = isPublic;
    },
    setPublicAccessLoading: (state, action: PayloadAction<{shelfId: string, loading: boolean}>) => {
      const { shelfId, loading } = action.payload;
      state.loading.publicAccess[shelfId] = loading;
    },
    // Tag-related reducers
    setTagFilter: (state, action: PayloadAction<string | null>) => {
      state.currentTagFilter = action.payload;
    },
    clearTagSearchResults: (state) => {
      state.tagSearchResults = [];
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
      })
      
      // Handle createShelf
      .addCase(createShelf.pending, (state) => {
        state.error = null;
      })
      .addCase(createShelf.fulfilled, (state, action) => {
        // We'll reload shelves via loadShelves thunk, so no need to modify state here
      })
      .addCase(createShelf.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle updateShelfMetadata
      .addCase(updateShelfMetadata.pending, (state) => {
        state.error = null;
      })
      .addCase(updateShelfMetadata.fulfilled, (state, action) => {
        const { shelfId, title } = action.payload;
        
        // Only update the title which we know is a string
        if (shelfId && title && state.entities.shelves[shelfId]) {
          state.entities.shelves[shelfId].title = title;
        }
      })
      .addCase(updateShelfMetadata.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle createAndAddShelfItem
      .addCase(createAndAddShelfItem.pending, (state) => {
        state.error = null;
      })
      .addCase(createAndAddShelfItem.fulfilled, (state, action) => {
        // We'll get the updated shelves via loadShelves, so no need to modify state here
      })
      .addCase(createAndAddShelfItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle getShelfById
      .addCase(getShelfById.pending, (state) => {
        state.error = null;
      })
      .addCase(getShelfById.fulfilled, (state, action) => {
        const shelf = action.payload;
        if (shelf && shelf.shelf_id) {
          const normalized = normalizeShelf(shelf);
          const shelfId = normalized.shelf_id;
          state.entities.shelves[shelfId] = normalized;
        }
      })
      .addCase(getShelfById.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle addItem
      .addCase(addItem.pending, (state) => {
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        // Item added successfully, will be reflected when the shelf is loaded
      })
      .addCase(addItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle removeItem
      .addCase(removeItem.pending, (state) => {
        state.error = null;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        // Item removed successfully, will be reflected when the shelf is loaded
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle reorderProfileShelf
      .addCase(reorderProfileShelf.pending, (state) => {
        state.error = null;
      })
      .addCase(reorderProfileShelf.fulfilled, (state, action) => {
        const { newShelfOrder } = action.payload;
        
        // Apply the new shelf order if it was provided
        if (newShelfOrder) {
          state.ids.userShelves = newShelfOrder;
        }
      })
      .addCase(reorderProfileShelf.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle listShelfEditors
      .addCase(listShelfEditors.pending, (state, action) => {
        const shelfId = action.meta.arg;
        state.loading.editors[shelfId] = true;
        state.error = null;
      })
      .addCase(listShelfEditors.fulfilled, (state, action) => {
        const { shelfId, editors } = action.payload;
        state.shelfEditors[shelfId] = editors;
        state.loading.editors[shelfId] = false;
      })
      .addCase(listShelfEditors.rejected, (state, action) => {
        const shelfId = action.meta.arg;
        state.loading.editors[shelfId] = false;
        state.error = action.payload as string;
      })
      
      // Handle addShelfEditor
      .addCase(addShelfEditor.pending, (state) => {
        state.error = null;
      })
      .addCase(addShelfEditor.fulfilled, (state, action) => {
        const { shelfId } = action.payload;
        // The next listShelfEditors call will update the editors
      })
      .addCase(addShelfEditor.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle removeShelfEditor
      .addCase(removeShelfEditor.pending, (state) => {
        state.error = null;
      })
      .addCase(removeShelfEditor.fulfilled, (state, action) => {
        const { shelfId, editorPrincipal } = action.payload;
        // Update the editors list if it exists
        if (state.shelfEditors[shelfId]) {
          state.shelfEditors[shelfId] = state.shelfEditors[shelfId].filter(
            editor => editor !== editorPrincipal
          );
        }
      })
      .addCase(removeShelfEditor.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle setItemOrder (NEW)
      .addCase(setItemOrder.pending, (state, action) => {
        const { shelfId } = action.meta.arg;
        // Optionally apply optimistic update here if needed, but fulfilled handles it
        state.error = null;
      })
      .addCase(setItemOrder.fulfilled, (state, action) => {
        // Revert to using newItemOrder as per the original code
        const { shelfId, newItemOrder } = action.payload; 
        state.ids.shelfItems[shelfId] = newItemOrder;
      })
      .addCase(setItemOrder.rejected, (state, action) => { state.error = action.payload as string; })
      
      // Handle checkShelfPublicAccess
      .addCase(checkShelfPublicAccess.pending, (state, action) => {
        const shelfId = action.meta.arg;
        state.loading.publicAccess[shelfId] = true;
        state.error = null;
      })
      .addCase(checkShelfPublicAccess.fulfilled, (state, action) => {
        const { shelfId, isPublic } = action.payload;
        // console.log(`[Reducer checkShelfPublicAccess.fulfilled] Shelf: ${shelfId}, Payload isPublic: ${isPublic}, Current state:`, state.publicShelfAccess[shelfId]);
        // Only update the state if the payload is explicitly a boolean
        if (typeof isPublic === 'boolean') {
          state.publicShelfAccess[shelfId] = isPublic;
          // console.log(`[Reducer checkShelfPublicAccess.fulfilled] Shelf: ${shelfId}, Updated state to:`, state.publicShelfAccess[shelfId]);
        } else {
          // console.log(`[Reducer checkShelfPublicAccess.fulfilled] Shelf: ${shelfId}, Received non-boolean payload (${isPublic}). Not updating state.`);
        }
        state.loading.publicAccess[shelfId] = false;
      })
      .addCase(checkShelfPublicAccess.rejected, (state, action) => {
        const shelfId = action.meta.arg;
        state.loading.publicAccess[shelfId] = false;
        state.error = action.payload as string;
      })
      
      // Handle toggleShelfPublicAccess
      .addCase(toggleShelfPublicAccess.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleShelfPublicAccess.fulfilled, (state, action) => {
        const { shelfId, isPublic } = action.payload;
        // console.log(`[Reducer toggleShelfPublicAccess.fulfilled] Shelf: ${shelfId}, Payload isPublic: ${isPublic}, Current state:`, state.publicShelfAccess[shelfId]);
        // Update the public access status
        state.publicShelfAccess[shelfId] = isPublic;
        // console.log(`[Reducer toggleShelfPublicAccess.fulfilled] Shelf: ${shelfId}, New state:`, state.publicShelfAccess[shelfId]);
      })
      .addCase(toggleShelfPublicAccess.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // --- Tag Thunk Reducers ---
      .addCase(fetchPopularTags.pending, (state) => {
        state.loading.popularTags = true;
        state.error = null;
      })
      .addCase(fetchPopularTags.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.popularTags = action.payload;
        state.loading.popularTags = false;
      })
      .addCase(fetchPopularTags.rejected, (state, action) => {
        state.loading.popularTags = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchShelvesByTag.pending, (state) => {
        state.loading.shelvesByTag = true;
        state.error = null;
      })
      .addCase(fetchShelvesByTag.fulfilled, (state, action: PayloadAction<{ tag: string; shelfIds: string[] }>) => {
        const { tag, shelfIds } = action.payload;
        state.ids.shelvesByTag[tag] = shelfIds;
        state.loading.shelvesByTag = false;
      })
      .addCase(fetchShelvesByTag.rejected, (state, action) => {
        state.loading.shelvesByTag = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchTagShelfCount.pending, (state) => {
        state.loading.tagCounts = true;
        state.error = null;
      })
      .addCase(fetchTagShelfCount.fulfilled, (state, action: PayloadAction<{ tag: string; count: number }>) => {
        const { tag, count } = action.payload;
        state.tagShelfCounts[tag] = count;
        state.loading.tagCounts = false;
      })
      .addCase(fetchTagShelfCount.rejected, (state, action) => {
        state.loading.tagCounts = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchTagsWithPrefix.pending, (state) => {
        state.loading.tagSearch = true;
        state.error = null;
      })
      .addCase(fetchTagsWithPrefix.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.tagSearchResults = action.payload;
        state.loading.tagSearch = false;
      })
      .addCase(fetchTagsWithPrefix.rejected, (state, action) => {
        state.loading.tagSearch = false;
        state.error = action.payload as string;
      });
      // --- End Tag Thunk Reducers ---
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
  setShelfPublicAccess,
  setPublicAccessLoading,
  updateShelfOrder,
  updateItemOrder,
  setTagFilter,
  clearTagSearchResults
} = perpetuaSlice.actions;
export default perpetuaSlice.reducer;

// // # SELECTORS # // //
const selectPerpetuaState = (state: RootState) => state.perpetua;
// Export selectShelvesEntities
export const selectShelvesEntities = (state: RootState): Record<string, NormalizedShelf> => state.perpetua.entities.shelves;
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

const selectPublicAccessByIdMap = (state: RootState) => state.perpetua.publicShelfAccess;
const selectPublicAccessLoadingMap = (state: RootState) => state.perpetua.loading.publicAccess;

// Enhanced selector caching mechanism
// This stores actual selector instances instead of creating new ones each time
const memoizedSelectorsByShelfId = {
  shelfById: new Map<string, ReturnType<typeof createSelector>>(),
  shelfEditors: new Map<string, ReturnType<typeof createSelector>>(),
  editorsLoading: new Map<string, ReturnType<typeof createSelector>>(),
  hasEditAccess: new Map<string, ReturnType<typeof createSelector>>(),
  isOwner: new Map<string, ReturnType<typeof createSelector>>(),
  isEditor: new Map<string, ReturnType<typeof createSelector>>(),
  isPublic: new Map<string, ReturnType<typeof createSelector>>(),
  publicAccessLoading: new Map<string, ReturnType<typeof createSelector>>(),
  optimisticShelfItemOrder: new Map<string, ReturnType<typeof createSelector>>(),
};

// Selectors
// Get the order of user shelves directly from state
const selectOptimisticShelfOrder = (state: RootState) => state.perpetua.ids.userShelves;

// Remove export keyword here
const selectUserShelves = createSelector(
  selectOptimisticShelfOrder,
  selectShelvesEntities,
  (shelfOrder, shelves) => shelfOrder.map(id => shelves[id]).filter(Boolean)
);

// Remove export keyword here
const selectShelfById = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.shelfById.has(shelfId)) {
    const selector = createSelector(
      selectShelvesEntities,
      (shelves) => shelves[shelfId] || null
    );
    memoizedSelectorsByShelfId.shelfById.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.shelfById.get(shelfId)!;
};

// Keep export here for now
const selectSelectedShelf = createSelector(
  selectSelectedShelfId,
  selectShelvesEntities,
  (selectedShelfId, shelves) => {
    if (!selectedShelfId) return null;
    return shelves[selectedShelfId] || null;
  }
);

// Get the optimistically updated ordered item IDs for a shelf - memoized factory selector with improved caching
const selectOptimisticShelfItemOrder = (shelfId: string) => {
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
const selectShelfEditors = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.shelfEditors.has(shelfId)) {
    const selector = createSelector(
      selectShelfEditorsByIdMap,
      (editorsMap) => editorsMap[shelfId] || [] // Return direct reference from state
    );
    memoizedSelectorsByShelfId.shelfEditors.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.shelfEditors.get(shelfId)!;
};

const selectEditorsLoading = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.editorsLoading.has(shelfId)) {
    const selector = createSelector(
      selectEditorsLoadingMap,
      (loadingMap) => Boolean(loadingMap[shelfId]) // Transform to boolean
    );
    memoizedSelectorsByShelfId.editorsLoading.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.editorsLoading.get(shelfId)!;
};

// Get the public access status for a shelf - with improved caching
const selectIsShelfPublic = (shelfId: string): ((state: RootState) => boolean) => {
  if (!memoizedSelectorsByShelfId.isPublic.has(shelfId)) {
    const selector = createSelector(
      selectPublicAccessByIdMap,
      (state: RootState) => selectShelvesEntities(state)[shelfId],
      (publicAccessMap, shelf): boolean => { // Explicitly type the result function's return value
        // console.log(`[Selector selectIsShelfPublic ${shelfId}] Map value: ${publicAccessMap[shelfId]}, Shelf entity:`, shelf ? shelf.is_public : 'undefined');
        // First check the dedicated map
        if (publicAccessMap[shelfId] !== undefined) {
          const result = Boolean(publicAccessMap[shelfId]);
          // console.log(`[Selector selectIsShelfPublic ${shelfId}] Using map value. Returning: ${result}`);
          return result;
        }
        
        // Fall back to the shelf entity if available
        // Ensure the generated Shelf type includes is_public: boolean
        if (shelf && typeof shelf.is_public === 'boolean') {
          // console.log(`[Selector selectIsShelfPublic ${shelfId}] Falling back to shelf entity. Returning: ${shelf.is_public}`);
          return shelf.is_public;
        }
        
        // Default to false if no data is available
        // console.log(`[Selector selectIsShelfPublic ${shelfId}] No data found. Returning default: false`);
        return false;
      }
    );
    memoizedSelectorsByShelfId.isPublic.set(shelfId, selector);
  }
  // We need to assert the type here because the Map stores a generic selector type
  return memoizedSelectorsByShelfId.isPublic.get(shelfId)! as (state: RootState) => boolean;
};

const selectPublicAccessLoading = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.publicAccessLoading.has(shelfId)) {
    const selector = createSelector(
      selectPublicAccessLoadingMap,
      (loadingMap) => Boolean(loadingMap[shelfId]) // Transform to boolean
    );
    memoizedSelectorsByShelfId.publicAccessLoading.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.publicAccessLoading.get(shelfId)!;
};

// Update the hasEditAccess selector to check for public access
const selectHasEditAccess = (contentId: string) => {
  if (!memoizedSelectorsByShelfId.hasEditAccess.has(contentId)) {
    const selector = createSelector(
      selectUserPrincipal,
      (state: RootState) => selectShelvesEntities(state)[contentId],
      (state: RootState) => selectShelfEditorsByIdMap(state)[contentId] || [],
      (state: RootState) => selectPublicAccessByIdMap(state)[contentId],
      (userPrincipal, shelf, editors, isPublic) => {
        if (!shelf) return false;
        
        // Check if shelf is public
        if (isPublic === true) return true;
        
        // For non-public shelves, user needs to be logged in
        if (!userPrincipal) return false;
        
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
const selectIsOwner = (contentId: string) => {
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
const selectIsEditor = (contentId: string) => {
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

// Get all shelves belonging to a specific user - memoized
const selectUserShelvesForUser = createSelector(
  [
    selectShelvesEntities,
    selectUserShelvesOrder,
    (_state: RootState, userId: string) => userId
  ],
  (shelves, userShelvesOrder, userId) => {
    // First check if we're looking at shelves for the current logged-in user
    // We can determine this by checking if any shelves in the ordered list belong to this user
    const isCurrentUserProfile = userShelvesOrder.length > 0 && 
      shelves[userShelvesOrder[0]]?.owner === userId;
    
    if (isCurrentUserProfile) {
      // For current user, respect the custom order from userShelvesOrder
      // But filter to ensure we only include this user's shelves (in case of any stale data)
      return userShelvesOrder
        .map(id => shelves[id])
        .filter(shelf => shelf && shelf.owner === userId);
    } else {
      // For other users, fall back to timestamp-based ordering
      const userShelves = Object.values(shelves)
        .filter(shelf => shelf && shelf.owner === userId)
        .sort((a, b) => {
          // Sort by createdAt if available, otherwise keep original order
          if (a.created_at && b.created_at) {
            return Number(b.created_at) - Number(a.created_at); // Newest first
          }
          return 0;
        });
      
      return userShelves;
    }
  }
);

// New memoized selectors for tags
const memoizedTagSelectors = {
  shelvesByTag: new Map<string, ReturnType<typeof createSelector>>(),
  tagShelfCount: new Map<string, ReturnType<typeof createSelector>>(),
};

// Tag Selectors
export const selectPopularTags = (state: RootState): string[] => state.perpetua.popularTags;
export const selectTagSearchResults = (state: RootState): string[] => state.perpetua.tagSearchResults;
export const selectCurrentTagFilter = (state: RootState): string | null => state.perpetua.currentTagFilter;
export const selectIsLoadingPopularTags = (state: RootState): boolean => state.perpetua.loading.popularTags;
export const selectIsLoadingShelvesForTag = (state: RootState): boolean => state.perpetua.loading.shelvesByTag;
export const selectIsTagSearchLoading = (state: RootState): boolean => state.perpetua.loading.tagSearch;
export const selectIsLoadingTagCounts = (state: RootState): boolean => state.perpetua.loading.tagCounts;

// Get shelf IDs for a specific tag - memoized factory selector
const selectShelfIdsForTag = (tag: string) => {
  if (!memoizedTagSelectors.shelvesByTag.has(tag)) {
    const selector = createSelector(
      selectShelvesByTagMap,
      (shelvesByTag) => shelvesByTag[tag] || [] // Return IDs or empty array
    );
    memoizedTagSelectors.shelvesByTag.set(tag, selector);
  }
  return memoizedTagSelectors.shelvesByTag.get(tag)!;
};

// Get shelf count for a specific tag - memoized factory selector
const selectTagShelfCount = (tag: string) => {
  if (!memoizedTagSelectors.tagShelfCount.has(tag)) {
    const selector = createSelector(
      selectTagShelfCountsMap,
      (counts) => counts[tag] // Return count or undefined
    );
    memoizedTagSelectors.tagShelfCount.set(tag, selector);
  }
  return memoizedTagSelectors.tagShelfCount.get(tag)!;
};

// Re-add export keyword here
export const selectPublicShelves = createSelector(
  selectPublicShelvesOrder,
  selectShelvesEntities,
  (publicShelves, shelves) => publicShelves.map(id => shelves[id]).filter(Boolean)
);

// Export existing selectors (remove selectPublicShelves from this block)
export { 
    selectOptimisticShelfOrder,
    selectUserShelves,
    selectShelfById,
    selectSelectedShelf,
    selectOptimisticShelfItemOrder,
    selectShelfEditors,
    selectEditorsLoading,
    selectIsShelfPublic,
    selectPublicAccessLoading,
    selectHasEditAccess,
    selectIsOwner,
    selectIsEditor,
    selectUserShelvesForUser,
    selectUserShelvesLoading,
    selectPublicShelvesLoading,
    selectPerpetuaError,
    selectLastTime,
    selectShelfIdsForTag,
    selectTagShelfCount
};

// Re-add definitions for base map selectors
const selectShelvesByTagMap = (state: RootState) => state.perpetua.ids.shelvesByTag;
const selectTagShelfCountsMap = (state: RootState) => state.perpetua.tagShelfCounts;

// This block should only export selectTagShelfCountsMap
export {
    selectTagShelfCountsMap
};