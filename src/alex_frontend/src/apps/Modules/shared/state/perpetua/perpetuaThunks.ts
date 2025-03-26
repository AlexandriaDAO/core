import { createAsyncThunk } from '@reduxjs/toolkit';
import { Shelf, Item, ItemContent } from '../../../../../../../declarations/perpetua/perpetua.did';
import { getActorPerpetua } from '@/features/auth/utils/authUtils';
import { Principal } from '@dfinity/principal';
import { convertBigIntsToStrings, convertStringsToBigInts } from '@/utils/bgint_convert';
import { 
  setSelectedShelf, 
  updateSingleShelf,
  setShelfEditors,
  setEditorsLoading
} from './perpetuaSlice';

// // # QUERY CALLS # // //

// Async thunks
export const loadShelves = createAsyncThunk(
  'perpetua/loadShelves',
  async (principal: Principal | string, { rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      
      // Convert string to Principal for the API call if needed
      const principalForApi = typeof principal === 'string'
        ? Principal.fromText(principal)
        : principal;
      
      const result = await perpetuaActor.get_user_shelves(principalForApi, []);
      
      if ("Ok" in result) {
        // Convert all BigInt values to strings before returning to Redux
        const shelves = convertBigIntsToStrings(result.Ok);
        
        // We keep the owner as a Principal type here to match the Shelf interface
        // The Principal will be converted to string when needed in the UI
        return shelves;
      } else {
        return rejectWithValue("Failed to load shelves");
      }
    } catch (error) {
      console.error("Failed to load shelves:", error);
      return rejectWithValue("Failed to load shelves");
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
        // This will also convert Principal objects to strings
        const shelves = convertBigIntsToStrings(result.Ok);
        const serializedBeforeTimestamp = beforeTimestampBigInt ? beforeTimestampBigInt.toString() : undefined;
        const serializedLastTimestamp = lastShelfTimestamp ? lastShelfTimestamp.toString() : undefined;
        
        return { 
          shelves, 
          beforeTimestamp: serializedBeforeTimestamp,
          lastTimestamp: serializedLastTimestamp
        };
      } else {
        return rejectWithValue("Failed to load recent shelves");
      }
    } catch (error) {
      console.error("Failed to load recent shelves:", error);
      return rejectWithValue("Failed to load recent shelves");
    }
  }
);

// export const getShelfPositionMetrics = createAsyncThunk(
//   'perpetua/getShelfPositionMetrics',
//   async (shelfId: string, { rejectWithValue }) => {
//     try {
//       const perpetuaActor = await getActorPerpetua();
//       const result = await perpetuaActor.get_shelf_position_metrics(shelfId);
      
//       if ("Ok" in result) {
//         return result.Ok;
//       } else {
//         return rejectWithValue("Failed to get shelf position metrics");
//       }
//     } catch (error) {
//       console.error("Failed to get shelf position metrics:", error);
//       return rejectWithValue("Failed to get shelf position metrics");
//     }
//   }
// );




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
        // Reload shelves after creating a new one
        dispatch(loadShelves(principal));
        return { shelfId: result.Ok };
      } else if ("Err" in result) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to create shelf");
      }
    } catch (error) {
      console.error("Failed to create shelf:", error);
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
      
      console.log(`Adding ${type} content to shelf: ${shelf.title}, content: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
      
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
        // Reload the shelf data after adding a item
        dispatch(loadShelves(principal));
        return convertBigIntsToStrings({ shelf_id: shelf.shelf_id });
      } else if ("Err" in result) {
        // Enhanced error handling for specific backend errors
        const errorMessage = result.Err;
        console.error("Backend error adding item:", errorMessage);
        return rejectWithValue(errorMessage);
      } else {
        return rejectWithValue("Unknown error adding item");
      }
    } catch (error) {
      // Better error message handling
      console.error("Failed to add item:", error);
      
      let errorMessage = "Failed to add item";
      
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
        // Instead of reloading all shelves, just get the specific updated shelf
        // This is a more targeted approach to avoid full state refresh
        const specificShelfResult = await perpetuaActor.get_shelf(shelfId);
        if ("Ok" in specificShelfResult) {
          // Update just this shelf in the Redux store
          // We'll handle this in the slice reducer
          dispatch(updateSingleShelf(convertBigIntsToStrings(specificShelfResult.Ok)));
        }
        return convertBigIntsToStrings({ shelfId, itemId, referenceItemId, before });
      } else {
        return rejectWithValue("Failed to reorder item");
      }
    } catch (error) {
      console.error("Failed to reorder item:", error);
      return rejectWithValue("Failed to reorder item");
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
        // Get updated shelf data
        const specificShelfResult = await perpetuaActor.get_shelf(shelfId);
        if ("Ok" in specificShelfResult) {
          dispatch(updateSingleShelf(convertBigIntsToStrings(specificShelfResult.Ok)));
        }
        
        return convertBigIntsToStrings({ shelfId, title, description });
      } else {
        return rejectWithValue("Failed to update shelf metadata");
      }
    } catch (error) {
      console.error("Failed to update shelf metadata:", error);
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
        // Get updated shelf data
        const specificShelfResult = await perpetuaActor.get_shelf(shelfId);
        if ("Ok" in specificShelfResult) {
          dispatch(updateSingleShelf(convertBigIntsToStrings(specificShelfResult.Ok)));
        }
        
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
      
      const perpetuaActor = await getActorPerpetua();
      const result = await perpetuaActor.list_shelf_editors(shelfId);
      
      if ("Ok" in result) {
        // Convert Principal objects to strings
        const editorPrincipals = result.Ok.map(principal => principal.toString());
        
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
        // Refresh the editors list
        dispatch(listShelfEditors(shelfId));
        
        // Get updated shelf data to ensure UI is consistent
        const specificShelfResult = await perpetuaActor.get_shelf(shelfId);
        if ("Ok" in specificShelfResult) {
          dispatch(updateSingleShelf(convertBigIntsToStrings(specificShelfResult.Ok)));
        }
        
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
        // Refresh the editors list
        dispatch(listShelfEditors(shelfId));
        
        // Get updated shelf data to ensure UI is consistent
        const specificShelfResult = await perpetuaActor.get_shelf(shelfId);
        if ("Ok" in specificShelfResult) {
          dispatch(updateSingleShelf(convertBigIntsToStrings(specificShelfResult.Ok)));
        }
        
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
        // Reload shelves to get both the new shelf and the updated parent shelf
        dispatch(loadShelves(principal));
        
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
        // Get updated shelf data
        const specificShelfResult = await perpetuaActor.get_shelf(shelfId);
        if ("Ok" in specificShelfResult) {
          dispatch(updateSingleShelf(convertBigIntsToStrings(specificShelfResult.Ok)));
        } else {
          // Reload all shelves as a fallback
          dispatch(loadShelves(principal));
        }
        
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

// Profile Ordering Thunks
export const reorderProfileShelf = createAsyncThunk(
  'perpetua/reorderProfileShelf',
  async ({ 
    shelfId, 
    referenceShelfId, 
    before,
    principal
  }: { 
    shelfId: string, 
    referenceShelfId?: string, 
    before: boolean,
    principal: Principal | string
  }, { dispatch, rejectWithValue }) => {
    try {
      console.log(`=== PROFILE REORDERING DEBUG ===`);
      console.log(`Reordering shelf ${shelfId} ${before ? 'before' : 'after'} ${referenceShelfId || 'none'}`);
      
      const perpetuaActor = await getActorPerpetua();
      
      console.log(`API Call params:`, {
        shelfId,
        referenceShelfId: referenceShelfId ? [referenceShelfId] : [],
        before
      });
      
      const result = await perpetuaActor.reorder_profile_shelf(
        shelfId,
        referenceShelfId ? [referenceShelfId] : [],
        before
      );
      
      if ("Ok" in result) {
        console.log(`Profile reordering SUCCESS for shelf ${shelfId}`);
        // Reload shelves to get the updated order
        dispatch(loadShelves(principal));
        
        return { 
          success: true, 
          shelfId, 
          referenceShelfId, 
          before 
        };
      } else if ("Err" in result) {
        console.error(`Profile reordering FAILED with error:`, result.Err);
        return rejectWithValue(result.Err);
      } else {
        console.error(`Profile reordering FAILED with unknown error`);
        return rejectWithValue("Failed to reorder shelf in profile");
      }
    } catch (error) {
      console.error(`Profile reordering EXCEPTION:`, error);
      
      let errorMessage = "Failed to reorder shelf in profile";
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

export const resetProfileOrder = createAsyncThunk(
  'perpetua/resetProfileOrder',
  async (principal: Principal | string, { dispatch, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      
      const result = await perpetuaActor.reset_profile_order();
      
      if ("Ok" in result) {
        // Reload shelves to get the restored default order
        dispatch(loadShelves(principal));
        
        return { success: true };
      } else if ("Err" in result) {
        return rejectWithValue(result.Err);
      } else {
        return rejectWithValue("Failed to reset profile order");
      }
    } catch (error) {
      console.error("Failed to reset profile order:", error);
      
      let errorMessage = "Failed to reset profile order";
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