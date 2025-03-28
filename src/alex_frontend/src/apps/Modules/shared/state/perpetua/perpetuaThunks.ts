import { createAsyncThunk } from '@reduxjs/toolkit';
import { Shelf, Item, ItemContent } from '../../../../../../../declarations/perpetua/perpetua.did';
import { getActorPerpetua } from '@/features/auth/utils/authUtils';
import { Principal } from '@dfinity/principal';
import { convertBigIntsToStrings, convertStringsToBigInts } from '@/utils/bgint_convert';
import { 
  setSelectedShelf, 
  updateSingleShelf,
  setShelfEditors,
  setEditorsLoading,
  updateShelfOrder
} from './perpetuaSlice';

// Enhanced cache manager with more robust invalidation
class ShelvesCache {
  private static instance: ShelvesCache;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly TTL = 30000; // 30 seconds TTL
  
  private constructor() {
    this.cache = new Map();
  }
  
  public static getInstance(): ShelvesCache {
    if (!ShelvesCache.instance) {
      ShelvesCache.instance = new ShelvesCache();
    }
    return ShelvesCache.instance;
  }
  
  // Normalize principal to string format for consistent cache keys
  private normalizePrincipal(principal: Principal | string): string {
    return typeof principal === 'string' ? principal : principal.toString();
  }
  
  // Add shelf ID to the key for per-shelf caching
  private generateKey(principalOrId: Principal | string, type: string): string {
    const normalizedId = this.normalizePrincipal(principalOrId);
    return `${type}:${normalizedId}`;
  }
  
  // Get data from cache if valid
  public get<T>(principalOrId: Principal | string, type: string): T | null {
    const key = this.generateKey(principalOrId, type);
    const entry = this.cache.get(key);
    
    if (entry && (Date.now() - entry.timestamp < this.TTL)) {
      return entry.data as T;
    }
    
    return null;
  }
  
  // Store data in cache
  public set(principalOrId: Principal | string, type: string, data: any): void {
    const key = this.generateKey(principalOrId, type);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  // Invalidate specific cache entry
  public invalidate(principalOrId: Principal | string, type: string): void {
    const key = this.generateKey(principalOrId, type);
    this.cache.delete(key);
  }
  
  // Invalidate all cache entries for a principal
  public invalidateForPrincipal(principal: Principal | string): void {
    const principalStr = this.normalizePrincipal(principal);
    
    // Find all keys that contain this principal and delete them
    for (const key of this.cache.keys()) {
      if (key.includes(principalStr)) {
        this.cache.delete(key);
      }
    }
  }
  
  // Invalidate all cache entries for a shelf
  public invalidateForShelf(shelfId: string): void {
    // Find all keys that contain this shelf ID and delete them
    for (const key of this.cache.keys()) {
      if (key.includes(shelfId)) {
        this.cache.delete(key);
      }
    }
  }
  
  // Clear all cache
  public clear(): void {
    this.cache.clear();
  }
}

// Singleton cache instance
const cacheManager = ShelvesCache.getInstance();

// // # QUERY CALLS # // //

// Async thunks
export const loadShelves = createAsyncThunk(
  'perpetua/loadShelves',
  async (principal: Principal | string, { rejectWithValue, getState }) => {
    try {
      // Create a stable string ID for normalized principal
      const principalStr = typeof principal === 'string' 
        ? principal 
        : principal.toString();
      
      // Check cache first with the 'shelves' type
      const cachedData = cacheManager.get<Shelf[]>(principalStr, 'userShelves');
      if (cachedData) {
        return cachedData;
      }
      
      // No cache hit, so fetch from API
      const perpetuaActor = await getActorPerpetua();
      
      // Convert string to Principal for the API call if needed
      const principalForApi = typeof principal === 'string'
        ? Principal.fromText(principal)
        : principal;
      
      const result = await perpetuaActor.get_user_shelves(principalForApi, []);
      
      if ("Ok" in result) {
        // Convert all BigInt values to strings before returning to Redux
        const shelves = convertBigIntsToStrings(result.Ok);
        
        // Update the cache with typed key
        cacheManager.set(principalStr, 'userShelves', shelves);
        
        return shelves;
      } else {
        return rejectWithValue("Failed to load shelves");
      }
    } catch (error) {
      return rejectWithValue("Failed to load shelves");
    }
  }
);

// Explicit function to get a shelf by ID
export const getShelfById = createAsyncThunk(
  'perpetua/getShelfById',
  async (shelfId: string, { dispatch, rejectWithValue }) => {
    try {
      // Check cache first with the 'shelf' type
      const cachedData = cacheManager.get<Shelf>(shelfId, 'shelf');
      if (cachedData) {
        // Update the Redux store with the cached shelf
        dispatch(updateSingleShelf(cachedData));
        return cachedData;
      }
      
      const perpetuaActor = await getActorPerpetua();
      const result = await perpetuaActor.get_shelf(shelfId);
      
      if ("Ok" in result) {
        // Convert all BigInt values to strings
        const shelf = convertBigIntsToStrings(result.Ok);
        
        // Update the cache
        cacheManager.set(shelfId, 'shelf', shelf);
        
        // Update the Redux store
        dispatch(updateSingleShelf(shelf));
        
        return shelf;
      } else {
        return rejectWithValue(`Failed to load shelf ${shelfId}`);
      }
    } catch (error) {
      console.error(`Error fetching shelf ${shelfId}:`, error);
      return rejectWithValue(`Failed to load shelf ${shelfId}`);
    }
  }
);

export const loadRecentShelves = createAsyncThunk(
  'perpetua/loadRecentShelves',
  async ({ 
    limit = 20, 
    beforeTimestamp 
  }: { 
    limit?: number, 
    beforeTimestamp?: string | bigint 
  }, { rejectWithValue }) => {
    try {
      // Check cache only if this is the initial load (no beforeTimestamp)
      if (!beforeTimestamp) {
        const cachedData = cacheManager.get<any>('recent', 'publicShelves');
        if (cachedData) {
          return cachedData;
        }
      }
      
      const perpetuaActor = await getActorPerpetua();
      
      // Convert string beforeTimestamp to BigInt if necessary
      let beforeTimestampBigInt: bigint | undefined = undefined;
      if (beforeTimestamp) {
        beforeTimestampBigInt = typeof beforeTimestamp === 'string' 
          ? BigInt(beforeTimestamp) 
          : beforeTimestamp;
      }
      
      const result = await perpetuaActor.get_recent_shelves(
        [BigInt(limit)], 
        beforeTimestampBigInt ? [beforeTimestampBigInt] : []
      );
      
      if ("Ok" in result) {
        // Get the timestamp from the last shelf for pagination
        const lastShelfTimestamp = result.Ok.length > 0 
          ? result.Ok[result.Ok.length - 1].created_at 
          : undefined;
          
        // Convert all BigInt values to strings before returning to Redux
        const shelves = convertBigIntsToStrings(result.Ok);
        const serializedBeforeTimestamp = beforeTimestampBigInt ? beforeTimestampBigInt.toString() : undefined;
        const serializedLastTimestamp = lastShelfTimestamp ? lastShelfTimestamp.toString() : undefined;
        
        const responseData = { 
          shelves, 
          beforeTimestamp: serializedBeforeTimestamp,
          lastTimestamp: serializedLastTimestamp
        };
        
        // Only cache the initial load (no beforeTimestamp)
        if (!beforeTimestamp) {
          cacheManager.set('recent', 'publicShelves', responseData);
        }
        
        return responseData;
      } else {
        return rejectWithValue("Failed to load recent shelves");
      }
    } catch (error) {
      return rejectWithValue("Failed to load recent shelves");
    }
  }
);

// // # UPDATE CALLS # // //

export const createShelf = createAsyncThunk(
  'perpetua/createShelf',
  async ({ title, description, principal }: { title: string, description: string, principal: Principal | string }, { dispatch, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      // Initialize with empty items array instead of a default item
      const initialItems: Item[] = [];
      
      const result = await perpetuaActor.store_shelf(
        title,
        description ? [description] : [],
        initialItems
      );
      
      if ("Ok" in result) {
        // Invalidate all caches for this principal
        cacheManager.invalidateForPrincipal(principal);
        
        // Reload shelves after creating a new one
        dispatch(loadShelves(principal));
        return { shelfId: result.Ok };
      } else if ("Err" in result) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to create shelf");
      }
    } catch (error) {
      return rejectWithValue("Failed to create shelf");
    }
  }
);

export const addItem = createAsyncThunk(
  'perpetua/addItem',
  async ({ 
    shelf, 
    content, 
    type, 
    principal,
    referenceItemId = null,
    before = true
  }: { 
    shelf: Shelf, 
    content: string, 
    type: "Nft" | "Markdown" | "Shelf",
    principal: Principal | string,
    referenceItemId?: number | null,
    before?: boolean
  }, { dispatch, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      
      // Use the add_shelf_item method instead of updating the entire shelf
      const itemContent: ItemContent = type === "Nft" 
        ? { Nft: content } as ItemContent
        : type === "Shelf"
        ? { Shelf: content } as ItemContent
        : { Markdown: content } as ItemContent;
      
      const result = await perpetuaActor.add_item_to_shelf(
        shelf.shelf_id,
        {
          content: itemContent,
          reference_item_id: referenceItemId ? [referenceItemId] : [],
          before
        }
      );
      
      if ("Ok" in result) {
        // Invalidate caches for this shelf and principal
        cacheManager.invalidateForShelf(shelf.shelf_id);
        cacheManager.invalidateForPrincipal(principal);
        
        // Fetch the updated shelf directly
        dispatch(getShelfById(shelf.shelf_id));
        
        return convertBigIntsToStrings({ shelf_id: shelf.shelf_id });
      } else if ("Err" in result) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Unknown error adding item");
      }
    } catch (error) {
      let errorMessage = "Failed to add item";
      
      if (error instanceof Error) {
        if (error.message.includes("Rejected")) {
          try {
            const match = error.message.match(/Reject text: ['"](.*?)['"]/);
            if (match && match[1]) {
              errorMessage = match[1];
            }
          } catch (e) {
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const reorderItem = createAsyncThunk(
  'perpetua/reorderItem',
  async ({ 
    shelfId, 
    itemId, 
    referenceItemId, 
    before,
    principal
  }: { 
    shelfId: string, 
    itemId: number, 
    referenceItemId: number | null, 
    before: boolean,
    principal: Principal | string
  }, { dispatch, rejectWithValue, getState }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      const result = await perpetuaActor.reorder_shelf_item(
        shelfId,
        {
          item_id: itemId,
          reference_item_id: referenceItemId ? [referenceItemId] : [],
          before
        }
      );
      
      if ("Ok" in result) {
        // Invalidate caches for this shelf
        cacheManager.invalidateForShelf(shelfId);
        
        // Fetch the updated shelf data
        dispatch(getShelfById(shelfId));
        
        return convertBigIntsToStrings({ shelfId, itemId, referenceItemId, before });
      } else {
        return rejectWithValue("Failed to reorder item");
      }
    } catch (error) {
      return rejectWithValue("Failed to reorder item");
    }
  }
);

// Reorder a shelf within the user profile
export const reorderProfileShelf = createAsyncThunk(
  'perpetua/reorderProfileShelf',
  async ({ 
    shelfId, 
    referenceShelfId, 
    before,
    principal,
    newShelfOrder // Add a parameter for the complete new order
  }: { 
    shelfId: string, 
    referenceShelfId: string | null, 
    before: boolean,
    principal: Principal | string,
    newShelfOrder?: string[] // Optional complete order for optimistic updates
  }, { dispatch, rejectWithValue }) => {
    try {
      // If we have the complete new order, update it optimistically in Redux
      if (newShelfOrder) {
        dispatch(updateShelfOrder(newShelfOrder));
      }
      
      const perpetuaActor = await getActorPerpetua();
      const principalForApi = typeof principal === 'string'
        ? Principal.fromText(principal)
        : principal;
      
      // Execute the reordering
      const result = await perpetuaActor.reorder_profile_shelf(
        shelfId,
        referenceShelfId ? [referenceShelfId] : [],
        before
      );
      
      if ("Ok" in result) {
        // Invalidate all relevant caches
        cacheManager.invalidateForPrincipal(principal);
        cacheManager.invalidateForShelf(shelfId);
        if (referenceShelfId) {
          cacheManager.invalidateForShelf(referenceShelfId);
        }
        
        // Force a reload of the shelves to get the new custom order
        await dispatch(loadShelves(principalForApi));
        
        return convertBigIntsToStrings({ shelfId, referenceShelfId, before });
      } else {
        // If the API call failed and we did an optimistic update, we need to reload
        // to restore the correct order
        if (newShelfOrder) {
          await dispatch(loadShelves(principalForApi));
        }
        
        return rejectWithValue("Failed to reorder shelf");
      }
    } catch (error) {
      let errorMessage = "Failed to reorder shelf";
      if (error instanceof Error) {
        if (error.message.includes("Rejected")) {
          try {
            const match = error.message.match(/Reject text: ['"](.*?)['"]/);
            if (match && match[1]) {
              errorMessage = match[1];
            }
          } catch (e) {
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateShelfMetadata = createAsyncThunk(
  'perpetua/updateShelfMetadata',
  async ({
    shelfId,
    title,
    description
  }: {
    shelfId: string,
    title?: string,
    description?: string
  }, { dispatch, getState, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      
      // Call the dedicated update_shelf_metadata function
      const result = await perpetuaActor.update_shelf_metadata(
        shelfId,
        title ? [title] : [],
        description ? [description] : []
      );
      
      if ("Ok" in result) {
        // Invalidate cache for this shelf
        cacheManager.invalidateForShelf(shelfId);
        
        // Get updated shelf data
        dispatch(getShelfById(shelfId));
        
        return convertBigIntsToStrings({ shelfId, title, description });
      } else {
        return rejectWithValue("Failed to update shelf metadata");
      }
    } catch (error) {
      return rejectWithValue("Failed to update shelf metadata");
    }
  }
);

export const rebalanceShelfItems = createAsyncThunk(
  'perpetua/rebalanceShelfItems',
  async ({ shelfId, principal }: { shelfId: string, principal: Principal | string }, { dispatch, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      const result = await perpetuaActor.rebalance_shelf_items(shelfId);
      
      if ("Ok" in result) {
        // Invalidate cache for this shelf
        cacheManager.invalidateForShelf(shelfId);
        
        // Get updated shelf data
        dispatch(getShelfById(shelfId));
        
        return convertBigIntsToStrings({ shelfId });
      } else {
        return rejectWithValue("Failed to rebalance shelf items");
      }
    } catch (error) {
      console.error("Failed to rebalance shelf items:", error);
      return rejectWithValue("Failed to rebalance shelf items");
    }
  }
);

// // # COLLABORATION THUNKS # // //

// List editors for a shelf
export const listShelfEditors = createAsyncThunk(
  'perpetua/listShelfEditors',
  async (shelfId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setEditorsLoading({ shelfId, loading: true }));
      
      // Check cache first
      const cachedData = cacheManager.get<string[]>(shelfId, 'editors');
      if (cachedData) {
        dispatch(setShelfEditors({ shelfId, editors: cachedData }));
        dispatch(setEditorsLoading({ shelfId, loading: false }));
        return cachedData;
      }
      
      const perpetuaActor = await getActorPerpetua();
      const result = await perpetuaActor.list_shelf_editors(shelfId);
      
      if ("Ok" in result) {
        // Convert Principal objects to strings
        const editorPrincipals = result.Ok.map(principal => principal.toString());
        
        // Cache the editors
        cacheManager.set(shelfId, 'editors', editorPrincipals);
        
        // Update Redux state with editors
        dispatch(setShelfEditors({ shelfId, editors: editorPrincipals }));
        dispatch(setEditorsLoading({ shelfId, loading: false }));
        
        return editorPrincipals;
      } else {
        dispatch(setEditorsLoading({ shelfId, loading: false }));
        return rejectWithValue("Failed to list shelf editors");
      }
    } catch (error) {
      console.error("Failed to list shelf editors:", error);
      dispatch(setEditorsLoading({ shelfId, loading: false }));
      return rejectWithValue("Failed to list shelf editors");
    }
  }
);

// Add an editor to a shelf
export const addShelfEditor = createAsyncThunk(
  'perpetua/addShelfEditor',
  async ({
    shelfId,
    editorPrincipal
  }: {
    shelfId: string,
    editorPrincipal: string
  }, { dispatch, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      
      // Convert string to Principal for the API call
      const principalForApi = Principal.fromText(editorPrincipal);
      
      const result = await perpetuaActor.add_shelf_editor(shelfId, principalForApi);
      
      if ("Ok" in result) {
        // Invalidate the editors cache
        cacheManager.invalidate(shelfId, 'editors');
        
        // Refresh the editors list
        dispatch(listShelfEditors(shelfId));
        
        // Get updated shelf data
        dispatch(getShelfById(shelfId));
        
        return { success: true, shelfId, editorPrincipal };
      } else if ("Err" in result) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to add editor to shelf");
      }
    } catch (error) {
      console.error("Failed to add editor to shelf:", error);
      
      let errorMessage = "Failed to add editor to shelf";
      if (error instanceof Error) {
        if (error.message.includes("Rejected")) {
          try {
            const match = error.message.match(/Reject text: ['"](.*?)['"]/);
            if (match && match[1]) {
              errorMessage = match[1];
            }
          } catch (e) {
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove an editor from a shelf
export const removeShelfEditor = createAsyncThunk(
  'perpetua/removeShelfEditor',
  async ({
    shelfId,
    editorPrincipal
  }: {
    shelfId: string,
    editorPrincipal: string
  }, { dispatch, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      
      // Convert string to Principal for the API call
      const principalForApi = Principal.fromText(editorPrincipal);
      
      const result = await perpetuaActor.remove_shelf_editor(shelfId, principalForApi);
      
      if ("Ok" in result) {
        // Invalidate the editors cache
        cacheManager.invalidate(shelfId, 'editors');
        
        // Refresh the editors list
        dispatch(listShelfEditors(shelfId));
        
        // Get updated shelf data
        dispatch(getShelfById(shelfId));
        
        return { success: true, shelfId, editorPrincipal };
      } else if ("Err" in result) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to remove editor from shelf");
      }
    } catch (error) {
      console.error("Failed to remove editor from shelf:", error);
      
      let errorMessage = "Failed to remove editor from shelf";
      if (error instanceof Error) {
        if (error.message.includes("Rejected")) {
          try {
            const match = error.message.match(/Reject text: ['"](.*?)['"]/);
            if (match && match[1]) {
              errorMessage = match[1];
            }
          } catch (e) {
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const createAndAddShelfItem = createAsyncThunk(
  'perpetua/createAndAddShelfItem',
  async ({ 
    parentShelfId, 
    title, 
    description, 
    principal 
  }: { 
    parentShelfId: string, 
    title: string, 
    description: string, 
    principal: Principal | string 
  }, { dispatch, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      
      console.log(`Creating new shelf "${title}" and adding it as a item to parent shelf: ${parentShelfId}`);
      
      const result = await perpetuaActor.create_and_add_shelf_item(
        parentShelfId,
        title,
        description ? [description] : []
      );
      
      if ("Ok" in result) {
        // Invalidate all relevant caches
        cacheManager.invalidateForPrincipal(principal);
        cacheManager.invalidateForShelf(parentShelfId);
        
        // Reload shelves and get the updated parent shelf
        dispatch(loadShelves(principal));
        dispatch(getShelfById(parentShelfId));
        
        // Get the shelf ID from the result
        const newShelfId = result.Ok;
        
        return { success: true, parentShelfId, newShelfId };
      } else if ("Err" in result) {
        // Enhanced error handling for specific backend errors
        const errorMessage = result.Err;
        console.error("Backend error creating and adding shelf item:", errorMessage);
        return rejectWithValue(errorMessage);
      } else {
        return rejectWithValue("Unknown error creating and adding shelf item");
      }
    } catch (error) {
      console.error("Failed to create and add shelf item:", error);
      
      let errorMessage = "Failed to create and add shelf";
      
      // Try to extract more detailed error message
      if (error instanceof Error) {
        // Check if there's a more specific error message in the error object
        if (error.message.includes("Rejected")) {
          // Parse the rejection message which is often a nested structure
          try {
            const match = error.message.match(/Reject text: ['"](.*?)['"]/);
            if (match && match[1]) {
              errorMessage = match[1];
            }
          } catch (e) {
            // If parsing fails, use the original error message
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove a item from a shelf
export const removeItem = createAsyncThunk(
  'perpetua/removeItem',
  async ({ 
    shelfId, 
    itemId, 
    principal 
  }: { 
    shelfId: string, 
    itemId: number, 
    principal: Principal | string 
  }, { dispatch, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      
      console.log(`Removing item ${itemId} from shelf: ${shelfId}`);
      
      const result = await perpetuaActor.remove_item_from_shelf(
        shelfId,
        itemId
      );
      
      if ("Ok" in result) {
        // Invalidate cache for this shelf
        cacheManager.invalidateForShelf(shelfId);
        
        // Get updated shelf data
        dispatch(getShelfById(shelfId));
        
        return { success: true, shelfId, itemId };
      } else if ("Err" in result) {
        // Enhanced error handling for specific backend errors
        const errorMessage = result.Err;
        console.error("Backend error removing item:", errorMessage);
        return rejectWithValue(errorMessage);
      } else {
        return rejectWithValue("Unknown error removing item");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      
      let errorMessage = "Failed to remove item";
      
      // Try to extract more detailed error message
      if (error instanceof Error) {
        // Check if there's a more specific error message in the error object
        if (error.message.includes("Rejected")) {
          // Parse the rejection message which is often a nested structure
          try {
            const match = error.message.match(/Reject text: ['"](.*?)['"]/);
            if (match && match[1]) {
              errorMessage = match[1];
            }
          } catch (e) {
            // If parsing fails, use the original error message
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
); 