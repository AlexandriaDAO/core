import { createSlice, PayloadAction, createSelector, createAction, AsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { ShelfPublic } from '@/../../declarations/perpetua/perpetua.did';
import { 
  loadShelves, 
  loadRecentShelves,
  loadMissingShelves,
  getShelfById,
  // Import new feed thunks
  loadRandomFeed, 
  loadStorylineFeed 
} from './thunks/queryThunks';
import {
  createShelf,
  updateShelfMetadata,
} from './thunks/shelfThunks';
import {
  addItem,
  removeItem
} from './thunks/itemThunks';
import {
  reorderProfileShelf
} from './thunks/reorderThunks';
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

// Import follow thunks
import {
  loadMyFollowedTags,
  followTag,
  unfollowTag
} from './thunks/followThunks';

// TODO: Import tag thunks once created
// import {
//   fetchPopularTags,
//   fetchShelvesByTag,
//   fetchTagShelfCount,
//   fetchTagsWithPrefix
// } from './thunks/tagThunks'; // Placeholder

import { Principal } from '@dfinity/principal'; // Import Principal

// Import needed types from service
import { 
  OffsetPaginatedResponse, 
  CursorPaginatedResponse, 
  TimestampCursor, 
  TagPopularityKeyCursor, 
  TagShelfAssociationKeyCursor, 
  NormalizedTagCursor 
} from './services'; // Updated to use the new services index

// Define the permissions interfaces
export interface ContentPermissions {
  contentId: string;
  hasEditAccess: boolean;
}

// Normalized shelf interface - Export this type
export interface NormalizedShelf extends Omit<ShelfPublic, 'owner' | 'created_at' | 'updated_at'> {
  owner: string; // Always store owner as string for consistency
  public_editing: boolean; // Add public_editing field to match the backend
  created_at: string; // Store timestamp as string
  updated_at: string; // Store timestamp as string
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
    // New feed IDs
    randomFeedShelves: string[];
    storylineFeedShelves: string[];
    shelfItems: Record<string, number[]>; // Map of shelfId -> ordered itemIds
    shelvesByTag: Record<string, string[]>; // Map of tag -> shelf IDs
  };
  // References
  selectedShelfId: string | null;
  lastTimestamp: string | undefined;  // String representation of BigInt timestamp for recency feed
  // New feed cursors and state
  currentFeedType: 'recency' | 'random' | 'storyline';
  storylineFeedCursor: string | undefined;
  // Current tag filter
  currentTagFilter: string | null; 
  // Tag data
  popularTags: string[];
  tagSearchResults: string[];
  tagShelfCounts: Record<string, number>; // Map of tag -> count
  // Loading states
  loading: {
    userShelves: boolean;
    publicShelves: boolean; // Recency feed (public part)
    // New feed loading states
    randomFeed: boolean;
    storylineFeed: boolean;
    publicAccess: Record<string, boolean>; // Track loading state for public access checks
    popularTags: boolean;
    shelvesByTag: boolean;
    tagSearch: boolean;
    tagCounts: boolean;
    creatingShelf: boolean; // Add loading state for creating a shelf
    followedTagsList: boolean; // Loading state for the user's followed tags list
  };
  error: string | null;
  // Public access tracking
  publicShelfAccess: Record<string, boolean>; // Map of shelfId -> isPublic
  // User's followed tags
  followedTags: string[];
}

// Initial state
const initialState: PerpetuaState = {
  entities: {
    shelves: {},
  },
  ids: {
    userShelves: [],
    publicShelves: [],
    // Initialize new feed IDs
    randomFeedShelves: [],
    storylineFeedShelves: [],
    shelfItems: {},
    shelvesByTag: {},
  },
  selectedShelfId: null,
  lastTimestamp: undefined,
  // Initialize new feed state
  currentFeedType: 'recency', // Default to recency
  storylineFeedCursor: undefined,
  currentTagFilter: null,
  popularTags: [],
  tagSearchResults: [],
  tagShelfCounts: {},
  loading: {
    userShelves: false,
    publicShelves: false, // Recency feed loading
    // Initialize new feed loading states
    randomFeed: false,
    storylineFeed: false,
    publicAccess: {},
    popularTags: false,
    shelvesByTag: false,
    tagSearch: false,
    tagCounts: false,
    creatingShelf: false, // Initialize creatingShelf loading state
    followedTagsList: false, // Initialize loading state for followed tags
  },
  error: null,
  publicShelfAccess: {},
  followedTags: [], // Initialize followed tags
};

// Utility function to normalize a shelf
const normalizeShelf = (shelf: ShelfPublic): NormalizedShelf => {
  return {
    ...shelf,
    owner: typeof shelf.owner === 'string' ? shelf.owner : shelf.owner.toString(),
    public_editing: typeof shelf.public_editing === 'boolean' ? shelf.public_editing : false,
    // Convert timestamps to string during normalization
    created_at: String(shelf.created_at),
    updated_at: String(shelf.updated_at)
  };
};

// Utility function to normalize multiple shelves and return entities and ids
const normalizeShelves = (shelves: ShelfPublic[]): { 
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
    setSelectedShelf: (state, action: PayloadAction<ShelfPublic | string | null>) => {
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
    // New reducer to set the current feed type
    setCurrentFeedType: (state, action: PayloadAction<'recency' | 'random' | 'storyline'>) => {
      state.currentFeedType = action.payload;
      // Potentially clear other feed data when switching, or handle in component
    },
    setContentPermission: (state, action: PayloadAction<ContentPermissions>) => {
      // This is now handled via selectors - can be removed if not used elsewhere
    },
    clearPermissions: (state) => {
      // This is now handled via selectors - can be removed if not used elsewhere
    },
    clearError: (state) => {
      state.error = null;
    },
    // Update a single shelf in the normalized store
    updateSingleShelf: (state, action: PayloadAction<ShelfPublic>) => {
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
      .addCase(loadShelves.fulfilled, (state, action: PayloadAction<OffsetPaginatedResponse<ShelfPublic>>) => {
        const { items, offset, limit, total_count } = action.payload;
        const { entities, ids } = normalizeShelves(items);
        
        state.entities.shelves = { ...state.entities.shelves, ...entities };
        
        if (offset === 0) {
            state.ids.userShelves = ids;
        } else {
            // Decide how to handle subsequent pages - appending for now
            const newIds = ids.filter(id => !state.ids.userShelves.includes(id));
            state.ids.userShelves = [...state.ids.userShelves, ...newIds];
        }
        
        state.loading.userShelves = false;
      })
      .addCase(loadShelves.rejected, (state, action) => {
        state.loading.userShelves = false;
        state.error = action.payload || null; // Handle potential undefined payload
      })
      
      // Handle loadMissingShelves
      .addCase(loadMissingShelves.pending, (state) => {
        state.loading.userShelves = true;
        state.error = null;
      })
      .addCase(loadMissingShelves.fulfilled, (state, action: PayloadAction<ShelfPublic[]>) => {
        if (action.payload.length === 0) {
          state.loading.userShelves = false;
          return;
        }
        const { entities, ids } = normalizeShelves(action.payload);
        state.entities.shelves = { ...state.entities.shelves, ...entities };
        const newShelfIds = ids.filter(id => !state.ids.userShelves.includes(id));
        if (newShelfIds.length > 0) {
          state.ids.userShelves = [...state.ids.userShelves, ...newShelfIds];
        }
        state.loading.userShelves = false;
      })
      .addCase(loadMissingShelves.rejected, (state, action) => {
        state.loading.userShelves = false;
        state.error = action.payload || null; // Handle potential undefined payload
      })
      
      // Load recent public shelves
      .addCase(loadRecentShelves.pending, (state) => {
        state.loading.publicShelves = true;
        state.error = null;
      })
      // Explicitly type the action to include meta
      .addCase(loadRecentShelves.fulfilled, (state, action: ReturnType<typeof loadRecentShelves.fulfilled>) => {
        const { items, next_cursor, limit } = action.payload;
        const { entities, ids } = normalizeShelves(items);
        
        state.entities.shelves = { ...state.entities.shelves, ...entities };
        
        // Use meta argument to determine if it was the first page
        const isFirstPage = !action.meta.arg.params.cursor;
        if (isFirstPage) { 
          state.ids.publicShelves = ids;
        } else {
          const newIds = ids.filter(id => !state.ids.publicShelves.includes(id));
          state.ids.publicShelves = [...state.ids.publicShelves, ...newIds];
        }
        
        // NEW: Safely convert to string if bigint, otherwise use as is (handles string | undefined correctly)
        state.lastTimestamp = typeof next_cursor === 'bigint' ? next_cursor.toString() : next_cursor;
        state.loading.publicShelves = false;
      })
      .addCase(loadRecentShelves.rejected, (state, action) => {
        state.loading.publicShelves = false;
        state.error = action.payload || null; // Handle potential undefined payload
      })
      
      // Handle getShelfById
      .addCase(getShelfById.pending, (state) => { state.error = null; })
      .addCase(getShelfById.fulfilled, (state, action: PayloadAction<ShelfPublic>) => {
          const shelf = action.payload;
          if (shelf && shelf.shelf_id) {
              const normalized = normalizeShelf(shelf);
              state.entities.shelves[normalized.shelf_id] = normalized;
          }
      })
      .addCase(getShelfById.rejected, (state, action) => { state.error = action.payload || null; })
      
      // Handle createShelf
      .addCase(createShelf.pending, (state) => {
        state.loading.creatingShelf = true; // Set loading true
        state.error = null;
      })
      .addCase(createShelf.fulfilled, (state, action) => {
        const { shelfId, principal, title, description } = action.payload;
        
        // Convert BigInt to string for serialization
        const nowString = String(BigInt(Date.now() * 1_000_000)); 
        
        const newShelf: NormalizedShelf = {
          shelf_id: shelfId,
          owner: principal, 
          title: title,
          description: description ? [description] : [], 
          items: [], 
          tags: [],
          appears_in: [],
          item_positions: [],
          created_at: nowString, // Store as string (Matches updated type)
          updated_at: nowString, // Store as string (Matches updated type)
          public_editing: false, 
        };
        
        state.entities.shelves[shelfId] = newShelf;
        
        if (!state.ids.userShelves.includes(shelfId)) {
          state.ids.userShelves.unshift(shelfId);
        }
        state.loading.creatingShelf = false; // Set loading false on success
      })
      .addCase(createShelf.rejected, (state, action) => {
        state.loading.creatingShelf = false; // Set loading false on error
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
        const {shelfId} = action.meta.arg;
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
        const {shelfId} = action.meta.arg;
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
       // Explicitly type the action to include meta
      .addCase(fetchPopularTags.fulfilled, (state, action: ReturnType<typeof fetchPopularTags.fulfilled>) => {
        const { items, next_cursor } = action.payload;
        const isFirstPage = !action.meta.arg.params.cursor; 
        if (isFirstPage) {
           state.popularTags = items;
        }
        // Logic to append might be needed if UI supports infinite scroll for tags
        state.loading.popularTags = false;
      })
      .addCase(fetchPopularTags.rejected, (state, action) => {
        state.loading.popularTags = false;
        state.error = action.payload || null; // Handle potential undefined payload
      })
      
      .addCase(fetchShelvesByTag.pending, (state) => {
        state.loading.shelvesByTag = true;
        state.error = null;
      })
      // Explicitly type the action to include meta
      .addCase(fetchShelvesByTag.fulfilled, (state, action: ReturnType<typeof fetchShelvesByTag.fulfilled>) => {
        const { tag, response } = action.payload;
        const { items, next_cursor } = response;
        const isFirstPage = !action.meta.arg.params.cursor; 
        if (isFirstPage) { 
           state.ids.shelvesByTag[tag] = items;
         }
        // Logic to append might be needed
        state.loading.shelvesByTag = false;
      })
      .addCase(fetchShelvesByTag.rejected, (state, action) => {
        state.loading.shelvesByTag = false;
        state.error = action.payload || null; // Handle potential undefined payload
      })
      
      // Handle fetchTagShelfCount (No changes needed for payload)
      .addCase(fetchTagShelfCount.pending, (state) => { state.loading.tagCounts = true; state.error = null; })
      .addCase(fetchTagShelfCount.fulfilled, (state, action: PayloadAction<{ tag: string; count: number }>) => {
          const { tag, count } = action.payload;
          state.tagShelfCounts[tag] = count;
          state.loading.tagCounts = false;
      })
      .addCase(fetchTagShelfCount.rejected, (state, action) => { state.loading.tagCounts = false; state.error = action.payload || null; })
      
      .addCase(fetchTagsWithPrefix.pending, (state) => {
        state.loading.tagSearch = true;
        state.error = null;
      })
      // Explicitly type the action to include meta
      .addCase(fetchTagsWithPrefix.fulfilled, (state, action: ReturnType<typeof fetchTagsWithPrefix.fulfilled>) => {
        const { items, next_cursor } = action.payload;
        const isFirstPage = !action.meta.arg.params.cursor;
        // Replace search results entirely for now
        if (isFirstPage) {
            state.tagSearchResults = items;
        }
        // Logic to append might be needed
        state.loading.tagSearch = false;
      })
      .addCase(fetchTagsWithPrefix.rejected, (state, action) => {
        state.loading.tagSearch = false;
        state.error = action.payload || null; // Handle potential undefined payload
      });
      // --- End Tag Thunk Reducers ---

      // --- New Feed Thunk Reducers ---
      builder
        // Load Random Feed
        .addCase(loadRandomFeed.pending, (state) => {
          state.loading.randomFeed = true;
          state.error = null;
        })
        .addCase(loadRandomFeed.fulfilled, (state, action: PayloadAction<ShelfPublic[]>) => {
          const { entities, ids } = normalizeShelves(action.payload);
          state.entities.shelves = { ...state.entities.shelves, ...entities };
          state.ids.randomFeedShelves = ids; // Replace current random shelves
          state.loading.randomFeed = false;
        })
        .addCase(loadRandomFeed.rejected, (state, action) => {
          state.loading.randomFeed = false;
          state.error = action.payload || null;
        })

        // Load Storyline Feed
        .addCase(loadStorylineFeed.pending, (state) => {
          state.loading.storylineFeed = true;
          state.error = null;
        })
        .addCase(loadStorylineFeed.fulfilled, (state, action: ReturnType<typeof loadStorylineFeed.fulfilled>) => {
          const { items, next_cursor } = action.payload;
          const { entities, ids } = normalizeShelves(items);
          
          state.entities.shelves = { ...state.entities.shelves, ...entities };
          
          const isFirstPage = !action.meta.arg.params.cursor;
          if (isFirstPage) {
            state.ids.storylineFeedShelves = ids;
          } else {
            // Append new unique IDs
            const newIds = ids.filter(id => !state.ids.storylineFeedShelves.includes(id));
            state.ids.storylineFeedShelves = [...state.ids.storylineFeedShelves, ...newIds];
          }
          
          state.storylineFeedCursor = next_cursor ? String(next_cursor) : undefined;
          state.loading.storylineFeed = false;
        })
        .addCase(loadStorylineFeed.rejected, (state, action) => {
          state.loading.storylineFeed = false;
          state.error = action.payload || null;
        });
      // --- End New Feed Thunk Reducers ---

      // --- Followed Tags Thunk Reducers ---
      builder
        .addCase(loadMyFollowedTags.pending, (state) => {
          state.loading.followedTagsList = true;
          state.error = null; // Clear previous errors for this specific load
        })
        .addCase(loadMyFollowedTags.fulfilled, (state, action: PayloadAction<string[]>) => {
          state.followedTags = action.payload;
          state.loading.followedTagsList = false;
        })
        .addCase(loadMyFollowedTags.rejected, (state, action) => {
          state.loading.followedTagsList = false;
          state.error = action.payload || 'Failed to load followed tags'; // Set specific error or general
        })
        // Handle followTag and unfollowTag: they return the refreshed list or an error
        // Thus, their fulfilled state can be handled similarly to loadMyFollowedTags.fulfilled
        .addCase(followTag.pending, (state) => {
          state.loading.followedTagsList = true; // Indicate loading while follow/refresh happens
          state.error = null;
        })
        .addCase(followTag.fulfilled, (state, action: PayloadAction<string[]>) => {
          state.followedTags = action.payload; // Update with the refreshed list
          state.loading.followedTagsList = false;
        })
        .addCase(followTag.rejected, (state, action) => {
          state.loading.followedTagsList = false;
          state.error = action.payload || 'Failed to follow tag and refresh list';
        })
        .addCase(unfollowTag.pending, (state) => {
          state.loading.followedTagsList = true; // Indicate loading while unfollow/refresh happens
          state.error = null;
        })
        .addCase(unfollowTag.fulfilled, (state, action: PayloadAction<string[]>) => {
          state.followedTags = action.payload; // Update with the refreshed list
          state.loading.followedTagsList = false;
        })
        .addCase(unfollowTag.rejected, (state, action) => {
          state.loading.followedTagsList = false;
          state.error = action.payload || 'Failed to unfollow tag and refresh list';
        });
      // --- End Followed Tags Thunk Reducers ---
  },
});

// Export actions and reducer
export const { 
  setSelectedShelf, 
  // Export new action
  setCurrentFeedType,
  clearError, 
  updateSingleShelf,
  setContentPermission,
  clearPermissions,
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
const selectShelvesEntities = (state: RootState): Record<string, NormalizedShelf> => state.perpetua.entities.shelves;
const selectUserPrincipal = (state: RootState) => state.auth.user?.principal;
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
const selectShelvesByTagMap = (state: RootState) => state.perpetua.ids.shelvesByTag;
const selectTagShelfCountsMap = (state: RootState) => state.perpetua.tagShelfCounts;
const selectIsCreatingShelfLoading = (state: RootState) => state.perpetua.loading.creatingShelf; // Add selector

// Base input selectors for memoized lists
const selectShelves = (state: RootState) => state.perpetua.entities.shelves;
const selectUserShelfIds = (state: RootState) => state.perpetua.ids.userShelves;
const selectPublicShelfIds = (state: RootState) => state.perpetua.ids.publicShelves;
// Define ID-based selectors for new feeds FIRST
const selectRandomFeedShelfIds = (state: RootState) => state.perpetua.ids.randomFeedShelves;
const selectStorylineFeedShelfIds = (state: RootState) => state.perpetua.ids.storylineFeedShelves;

// Enhanced selector caching mechanism
const memoizedSelectorsByShelfId = {
  shelfById: new Map<string, ReturnType<typeof createSelector>>(),
  canAddItem: new Map<string, ReturnType<typeof createSelector>>(),
  isOwner: new Map<string, ReturnType<typeof createSelector>>(),
  isPublic: new Map<string, ReturnType<typeof createSelector>>(),
  publicAccessLoading: new Map<string, ReturnType<typeof createSelector>>(),
  optimisticShelfItemOrder: new Map<string, ReturnType<typeof createSelector>>(),
};

const memoizedTagSelectors = {
  shelvesByTag: new Map<string, ReturnType<typeof createSelector>>(),
  tagShelfCount: new Map<string, ReturnType<typeof createSelector>>(),
};

// --- Simple Selectors ---
export const selectPopularTags = (state: RootState): string[] => state.perpetua.popularTags;
export const selectTagSearchResults = (state: RootState): string[] => state.perpetua.tagSearchResults;
export const selectCurrentTagFilter = (state: RootState): string | null => state.perpetua.currentTagFilter;
export const selectIsLoadingPopularTags = (state: RootState): boolean => state.perpetua.loading.popularTags;
export const selectIsLoadingShelvesForTag = (state: RootState): boolean => state.perpetua.loading.shelvesByTag;
export const selectIsTagSearchLoading = (state: RootState): boolean => state.perpetua.loading.tagSearch;
export const selectIsLoadingTagCounts = (state: RootState): boolean => state.perpetua.loading.tagCounts;
export const selectIsCreatingShelf = selectIsCreatingShelfLoading; // Export the selector ONCE
export { 
    selectShelvesByTagMap,
    selectTagShelfCountsMap
};

// --- Memoized Selectors ---

// Select user's shelves (correctly memoized)
const selectUserShelves = createSelector(
  [selectUserShelfIds, selectShelves],
  (shelfIds, shelves) => shelfIds.map(id => shelves[id]).filter(Boolean)
);

// Select public shelves (correctly memoized)
const selectPublicShelves = createSelector(
  [selectPublicShelfIds, selectShelves],
  (shelfIds, shelves) => shelfIds.map(id => shelves[id]).filter(Boolean)
);

// NOW define the memoized selectors that use the ID-based ones defined above
// Select Random Feed shelves (memoized)
const selectRandomFeedShelves = createSelector(
  [selectRandomFeedShelfIds, selectShelves], // selectRandomFeedShelfIds is now defined before this
  (shelfIds, shelves) => shelfIds.map(id => shelves[id]).filter(Boolean)
);

// Select Storyline Feed shelves (memoized)
const selectStorylineFeedShelves = createSelector(
  [selectStorylineFeedShelfIds, selectShelves], // selectStorylineFeedShelfIds is now defined before this
  (shelfIds, shelves) => shelfIds.map(id => shelves[id]).filter(Boolean)
);

// Select a specific shelf by ID (memoized factory)
const selectShelfById = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.shelfById.has(shelfId)) {
    const selector = createSelector(
      selectShelves, // Use the base selector
      (shelves: Record<string, NormalizedShelf>) => shelves[shelfId] || null
    );
    memoizedSelectorsByShelfId.shelfById.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.shelfById.get(shelfId)!;
};

// Select the currently selected shelf
const selectSelectedShelf = createSelector(
  selectSelectedShelfId,
  selectShelves, // Use the base selector
  (selectedShelfId, shelves) => {
    if (!selectedShelfId) return null;
    return shelves[selectedShelfId] || null;
  }
);

// Get optimistically updated item order for a shelf (memoized factory)
const selectOptimisticShelfItemOrder = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.optimisticShelfItemOrder.has(shelfId)) {
    const selector = createSelector(
      selectShelfItemOrderMap,
      (itemOrderMap: Record<string, number[]>) => itemOrderMap[shelfId] || []
    );
    memoizedSelectorsByShelfId.optimisticShelfItemOrder.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.optimisticShelfItemOrder.get(shelfId)!;
};

// Select last timestamp - simplified
const selectLastTimestamp = selectLastTime;

// Select loading state for user shelves - simplified
const selectLoading = selectUserShelvesLoading;

// Select loading state for public shelves - simplified
const selectPublicLoading = selectPublicShelvesLoading;

// Select error state - Simplified to direct selector
const selectError = selectPerpetuaError; 

// Select public access status for a shelf (memoized factory)
const selectIsShelfPublic = (shelfId: string): ((state: RootState) => boolean) => {
  if (!memoizedSelectorsByShelfId.isPublic.has(shelfId)) {
    const selector = createSelector(
      selectPublicAccessByIdMap,
      (state: RootState) => selectShelves(state)[shelfId] as NormalizedShelf | undefined, // Use base selector, cast result
      (publicAccessMap, shelf): boolean => {
        if (publicAccessMap[shelfId] !== undefined) {
          return Boolean(publicAccessMap[shelfId]);
        }
        if (shelf && typeof shelf.public_editing === 'boolean') {
          return shelf.public_editing;
        }
        return false;
      }
    );
    memoizedSelectorsByShelfId.isPublic.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.isPublic.get(shelfId)! as (state: RootState) => boolean;
};

// Select loading state for public access of a specific shelf (memoized factory)
const selectPublicAccessLoading = (shelfId: string) => {
  if (!memoizedSelectorsByShelfId.publicAccessLoading.has(shelfId)) {
    const selector = createSelector(
      selectPublicAccessLoadingMap,
      (loadingMap: Record<string, boolean>) => Boolean(loadingMap[shelfId])
    );
    memoizedSelectorsByShelfId.publicAccessLoading.set(shelfId, selector);
  }
  return memoizedSelectorsByShelfId.publicAccessLoading.get(shelfId)!;
};

// Select if user is owner of a shelf (memoized factory)
const selectIsOwner = (contentId: string) => {
  if (!memoizedSelectorsByShelfId.isOwner.has(contentId)) {
    const selector = createSelector(
      selectUserPrincipal,
      (state: RootState) => selectShelves(state)[contentId] as NormalizedShelf | undefined, // Use base selector, cast result
      (userPrincipal, shelf) => {
        if (!shelf || !userPrincipal) return false;
        return shelf.owner === userPrincipal;
      }
    );
    memoizedSelectorsByShelfId.isOwner.set(contentId, selector);
  }
  return memoizedSelectorsByShelfId.isOwner.get(contentId)!;
};

// Select shelves for a specific user (memoized - uses other selectors)
const selectUserShelvesForUser = createSelector(
  [
    selectShelves, // Input 1: Stable reference to the shelves object
    selectUserShelfIds, // Input 2: Stable reference (usually) to user's shelf IDs array
    selectUserPrincipal, // Input 3: Current user's principal (stable string or null)
    (_state: RootState, userId: string) => userId // Input 4: The target userId (stable string)
  ],
  (shelves, userShelfIds, currentUserPrincipal, targetUserId) => {
    // All filtering/sorting/conditional logic happens here in the output function

    // Determine if we are looking at the current logged-in user's profile
    // This check should be reliable now that currentUserPrincipal is an input
    const isCurrentUserProfile = currentUserPrincipal === targetUserId;

    if (isCurrentUserProfile) {
      // For current user, use userShelfIds for order, filter by owner
      // Make sure the map/filter process only includes valid shelves owned by the target user
      return userShelfIds
        .map(id => shelves[id])
        .filter((shelf): shelf is NormalizedShelf => shelf !== undefined && shelf.owner === targetUserId);
    } else {
      // For other users, filter all shelves by owner and sort by creation date
      // Create the array from Object.values *inside* the output function
      const allShelvesArray = Object.values(shelves);
      return allShelvesArray
        .filter((shelf): shelf is NormalizedShelf => shelf !== undefined && shelf.owner === targetUserId)
        .sort((a, b) => {
          // Sort by createdAt (newest first), handling potential undefined values
          const timeA = BigInt(a.created_at ?? 0);
          const timeB = BigInt(b.created_at ?? 0);
          if (timeB > timeA) return 1;
          if (timeA > timeB) return -1;
          return 0;
        });
    }
  }
);

// Select shelf IDs for a specific tag (memoized factory)
const selectShelfIdsForTag = (tag: string) => {
  if (!memoizedTagSelectors.shelvesByTag.has(tag)) {
    const selector = createSelector(
      selectShelvesByTagMap,
      (shelvesByTag: Record<string, string[]>) => shelvesByTag[tag] || []
    );
    memoizedTagSelectors.shelvesByTag.set(tag, selector);
  }
  return memoizedTagSelectors.shelvesByTag.get(tag)!;
};

// Select shelf count for a specific tag (memoized factory)
const selectTagShelfCount = (tag: string) => {
  if (!memoizedTagSelectors.tagShelfCount.has(tag)) {
    const selector = createSelector(
      selectTagShelfCountsMap,
      (counts: Record<string, number>) => counts[tag] // Return count or undefined
    );
    memoizedTagSelectors.tagShelfCount.set(tag, selector);
  }
  return memoizedTagSelectors.tagShelfCount.get(tag)!;
};

// Select if user can add items to a shelf (memoized factory)
// Allows adding if the shelf is public OR the user is owner
const selectCanAddItem = (contentId: string) => {
  if (!memoizedSelectorsByShelfId.canAddItem.has(contentId)) {
    const selector = createSelector(
      (state: RootState) => selectIsShelfPublic(contentId)(state), // Is it public?
      (state: RootState) => selectIsOwner(contentId)(state),      // Is user the owner?
      (isPublic, isOwner) => {
        // Allow adding if public OR owner
        return isPublic || isOwner;
      }
    );
    memoizedSelectorsByShelfId.canAddItem.set(contentId, selector);
  }
  return memoizedSelectorsByShelfId.canAddItem.get(contentId)!;
};

// Selector for nested shelves data map (memoized factory)
const selectNestedShelvesDataMap = (shelfIds: string[]) => createSelector(
  selectShelves,
  (shelves) => {
    const map: Record<string, NormalizedShelf | undefined> = {};
    shelfIds.forEach(id => {
      map[id] = shelves[id]; // Assumes shelves[id] is NormalizedShelf | undefined
    });
    return map;
  }
);

// New feed selectors
const selectCurrentFeedType = (state: RootState) => state.perpetua.currentFeedType;
const selectStorylineFeedCursor = (state: RootState) => state.perpetua.storylineFeedCursor;

// New loading selectors
const selectRandomFeedLoading = (state: RootState) => state.perpetua.loading.randomFeed;
const selectStorylineFeedLoading = (state: RootState) => state.perpetua.loading.storylineFeed;

// Selectors for followed tags
export const selectMyFollowedTags = (state: RootState): string[] => state.perpetua.followedTags;
export const selectIsLoadingMyFollowedTags = (state: RootState): boolean => state.perpetua.loading.followedTagsList;

// --- Export Selectors ---
// Export the selectors needed by the application
export {
    // Base state parts (if needed directly, though usually derived selectors are preferred)
    selectShelvesEntities, 
    selectUserShelvesOrder, 
    selectPublicShelvesOrder, 

    // Derived Lists/Objects
    selectUserShelves,
    selectPublicShelves, 
    selectSelectedShelf,

    // Loading states
    selectLoading, 
    selectPublicLoading, 

    // Error state
    selectError, 

    // Other simple states
    selectLastTimestamp, 
    // Export new feed selectors
    selectCurrentFeedType,
    selectRandomFeedShelves,    // This should now be the correctly defined createSelector version
    selectStorylineFeedShelves, // This should now be the correctly defined createSelector version
    selectStorylineFeedCursor,
    selectRandomFeedLoading,
    selectStorylineFeedLoading,

    // Factory selectors (exported so they can be called with parameters)
    selectShelfById,
    selectOptimisticShelfItemOrder,
    selectIsShelfPublic,
    selectPublicAccessLoading,
    selectCanAddItem,
    selectIsOwner,
    selectUserShelvesForUser,
    selectShelfIdsForTag,
    selectTagShelfCount,
    selectNestedShelvesDataMap // Ensure this is correctly placed for export
};