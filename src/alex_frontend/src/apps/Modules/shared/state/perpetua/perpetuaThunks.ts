import { createAsyncThunk } from '@reduxjs/toolkit';
import { Shelf, Slot, SlotContent } from '../../../../../../../declarations/perpetua/perpetua.did';
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
      // Initialize with empty slots array instead of a default slot
      const initialSlots: Slot[] = [];
      
      const result = await perpetuaActor.store_shelf(
        title,
        description ? [description] : [],
        initialSlots
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

export const addSlot = createAsyncThunk(
  'perpetua/addSlot',
  async ({ 
    shelf, 
    content, 
    type, 
    principal,
    referenceSlotId = null,
    before = true
  }: { 
    shelf: Shelf, 
    content: string, 
    type: "Nft" | "Markdown" | "Shelf",
    principal: Principal | string,
    referenceSlotId?: number | null,
    before?: boolean
  }, { dispatch, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      
      console.log(`Adding ${type} content to shelf: ${shelf.title}, content: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
      
      // Use the add_shelf_slot method instead of updating the entire shelf
      const slotContent: SlotContent = type === "Nft" 
        ? { Nft: content } as SlotContent
        : type === "Shelf"
        ? { Shelf: content } as SlotContent
        : { Markdown: content } as SlotContent;
      
      const result = await perpetuaActor.add_shelf_slot(
        shelf.shelf_id,
        {
          content: slotContent,
          reference_slot_id: referenceSlotId ? [referenceSlotId] : [],
          before
        }
      );
      
      if ("Ok" in result) {
        // Reload the shelf data after adding a slot
        dispatch(loadShelves(principal));
        return convertBigIntsToStrings({ shelf_id: shelf.shelf_id });
      } else if ("Err" in result) {
        // Enhanced error handling for specific backend errors
        const errorMessage = result.Err;
        console.error("Backend error adding slot:", errorMessage);
        return rejectWithValue(errorMessage);
      } else {
        return rejectWithValue("Unknown error adding slot");
      }
    } catch (error) {
      // Better error message handling
      console.error("Failed to add slot:", error);
      
      let errorMessage = "Failed to add slot";
      
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

export const reorderSlot = createAsyncThunk(
  'perpetua/reorderSlot',
  async ({ 
    shelfId, 
    slotId, 
    referenceSlotId, 
    before,
    principal
  }: { 
    shelfId: string, 
    slotId: number, 
    referenceSlotId: number | null, 
    before: boolean,
    principal: Principal | string
  }, { dispatch, rejectWithValue, getState }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      const result = await perpetuaActor.reorder_shelf_slot(
        shelfId,
        {
          slot_id: slotId,
          reference_slot_id: referenceSlotId ? [referenceSlotId] : [],
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
        return convertBigIntsToStrings({ shelfId, slotId, referenceSlotId, before });
      } else {
        return rejectWithValue("Failed to reorder slot");
      }
    } catch (error) {
      console.error("Failed to reorder slot:", error);
      return rejectWithValue("Failed to reorder slot");
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

export const rebalanceShelfSlots = createAsyncThunk(
  'perpetua/rebalanceShelfSlots',
  async ({ shelfId, principal }: { shelfId: string, principal: Principal | string }, { dispatch, rejectWithValue }) => {
    try {
      const perpetuaActor = await getActorPerpetua();
      const result = await perpetuaActor.rebalance_shelf_slots(shelfId);
      
      if ("Ok" in result) {
        // Get updated shelf data
        const specificShelfResult = await perpetuaActor.get_shelf(shelfId);
        if ("Ok" in specificShelfResult) {
          dispatch(updateSingleShelf(convertBigIntsToStrings(specificShelfResult.Ok)));
        }
        
        return convertBigIntsToStrings({ shelfId });
      } else {
        return rejectWithValue("Failed to rebalance shelf slots");
      }
    } catch (error) {
      console.error("Failed to rebalance shelf slots:", error);
      return rejectWithValue("Failed to rebalance shelf slots");
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

export const createAndAddShelfSlot = createAsyncThunk(
  'perpetua/createAndAddShelfSlot',
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
      
      console.log(`Creating new shelf "${title}" and adding it as a slot to parent shelf: ${parentShelfId}`);
      
      const result = await perpetuaActor.create_and_add_shelf_slot(
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
        console.error("Backend error creating and adding shelf slot:", errorMessage);
        return rejectWithValue(errorMessage);
      } else {
        return rejectWithValue("Unknown error creating and adding shelf slot");
      }
    } catch (error) {
      console.error("Failed to create and add shelf slot:", error);
      
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