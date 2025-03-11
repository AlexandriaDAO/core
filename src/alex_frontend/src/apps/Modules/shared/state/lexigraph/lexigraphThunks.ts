import { createAsyncThunk } from '@reduxjs/toolkit';
import { Shelf, Slot, SlotContent } from '../../../../../../../declarations/lexigraph/lexigraph.did';
import { getActorLexigraph } from '@/features/auth/utils/authUtils';
import { Principal } from '@dfinity/principal';

// // # QUERY CALLS # // //

// Async thunks
export const loadShelves = createAsyncThunk(
  'lexigraph/loadShelves',
  async (principal: Principal, { rejectWithValue }) => {
    try {
      const lexigraphActor = await getActorLexigraph();
      const result = await lexigraphActor.get_user_shelves(principal, []);
      
      if ("Ok" in result) {
        return result.Ok;
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
  'lexigraph/loadRecentShelves',
  async ({ 
    limit = 20, 
    beforeTimestamp 
  }: { 
    limit?: number, 
    beforeTimestamp?: bigint 
  }, { rejectWithValue }) => {
    try {
      const lexigraphActor = await getActorLexigraph();
      const result = await lexigraphActor.get_recent_shelves(
        [BigInt(limit)], 
        beforeTimestamp ? [beforeTimestamp] : []
      );
      
      if ("Ok" in result) {
        return { 
          shelves: result.Ok, 
          beforeTimestamp,
          lastTimestamp: result.Ok.length > 0 ? result.Ok[result.Ok.length - 1].created_at : undefined
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
//   'lexigraph/getShelfPositionMetrics',
//   async (shelfId: string, { rejectWithValue }) => {
//     try {
//       const lexigraphActor = await getActorLexigraph();
//       const result = await lexigraphActor.get_shelf_position_metrics(shelfId);
      
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
  'lexigraph/createShelf',
  async ({ title, description, principal }: { title: string, description: string, principal: Principal }, { dispatch, rejectWithValue }) => {
    try {
      const lexigraphActor = await getActorLexigraph();
      // Initialize with empty slots array instead of a default slot
      const initialSlots: Slot[] = [];
      
      const result = await lexigraphActor.store_shelf(
        title,
        description ? [description] : [],
        initialSlots
      );
      
      if ("Ok" in result) {
        // Reload shelves after creating a new one
        dispatch(loadShelves(principal));
        return result.Ok;
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
  'lexigraph/addSlot',
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
    principal: Principal,
    referenceSlotId?: number | null,
    before?: boolean
  }, { dispatch, rejectWithValue }) => {
    try {
      const lexigraphActor = await getActorLexigraph();
      
      // Use the add_shelf_slot method instead of updating the entire shelf
      const slotContent: SlotContent = type === "Nft" 
        ? { Nft: content } as SlotContent
        : type === "Shelf"
        ? { Shelf: content } as SlotContent
        : { Markdown: content } as SlotContent;
      
      const result = await lexigraphActor.add_shelf_slot(
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
        return { shelf_id: shelf.shelf_id };
      } else {
        return rejectWithValue("Failed to add slot");
      }
    } catch (error) {
      console.error("Failed to add slot:", error);
      return rejectWithValue("Failed to add slot");
    }
  }
);

export const reorderSlot = createAsyncThunk(
  'lexigraph/reorderSlot',
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
    principal: Principal
  }, { dispatch, rejectWithValue }) => {
    try {
      const lexigraphActor = await getActorLexigraph();
      const result = await lexigraphActor.reorder_shelf_slot(
        shelfId,
        {
          slot_id: slotId,
          reference_slot_id: referenceSlotId ? [referenceSlotId] : [],
          before
        }
      );
      
      if ("Ok" in result) {
        // Reload shelves after reordering slots
        dispatch(loadShelves(principal));
        return { shelfId, slotId, referenceSlotId, before };
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
  'lexigraph/updateShelfMetadata',
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
      const lexigraphActor = await getActorLexigraph();
      
      // Call the dedicated update_shelf_metadata function
      const result = await lexigraphActor.update_shelf_metadata(
        shelfId,
        title ? [title] : [],
        description ? [description] : []
      );
      
      if ("Ok" in result) {
        // Get the principal from state if available
        const state = getState() as { auth: { principal: Principal | null } };
        const principal = state.auth?.principal;
        
        // Reload shelves to refresh the data
        if (principal) {
          dispatch(loadShelves(principal));
        }
        return { shelfId, title, description };
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
  'lexigraph/rebalanceShelfSlots',
  async ({ shelfId, principal }: { shelfId: string, principal: Principal }, { dispatch, rejectWithValue }) => {
    try {
      const lexigraphActor = await getActorLexigraph();
      const result = await lexigraphActor.rebalance_shelf_slots(shelfId);
      
      if ("Ok" in result) {
        // Reload shelves after rebalancing
        dispatch(loadShelves(principal));
        return { shelfId };
      } else {
        return rejectWithValue("Failed to rebalance shelf slots");
      }
    } catch (error) {
      console.error("Failed to rebalance shelf slots:", error);
      return rejectWithValue("Failed to rebalance shelf slots");
    }
  }
); 