import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Shelf, Slot, SlotContent } from '../../../../../../../declarations/lexigraph/lexigraph.did';
import { getActorLexigraph } from '@/features/auth/utils/authUtils';
import { Principal } from '@dfinity/principal';

// Define the state interface
interface LexigraphState {
  shelves: Shelf[];
  publicShelves: Shelf[];
  selectedShelf: Shelf | null;
  lastTimestamp: bigint | undefined;
  loading: boolean;
  publicLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: LexigraphState = {
  shelves: [],
  publicShelves: [],
  selectedShelf: null,
  lastTimestamp: undefined,
  loading: false,
  publicLoading: false,
  error: null,
};

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

export const createShelf = createAsyncThunk(
  'lexigraph/createShelf',
  async ({ title, description, principal }: { title: string, description: string, principal: Principal }, { dispatch, rejectWithValue }) => {
    try {
      const lexigraphActor = await getActorLexigraph();
      const initialSlots: Slot[] = [
        {
          id: 1,
          content: { Markdown: "New shelf" } as SlotContent
        }
      ];
      
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

export const deleteShelf = createAsyncThunk(
  'lexigraph/deleteShelf',
  async ({ shelfId, principal }: { shelfId: string, principal: Principal }, { dispatch, rejectWithValue }) => {
    try {
      const lexigraphActor = await getActorLexigraph();
      const result = await lexigraphActor.delete_shelf(shelfId);
      
      if ("Ok" in result) {
        // Reload shelves after deleting one
        dispatch(loadShelves(principal));
        return shelfId;
      } else {
        return rejectWithValue("Failed to delete shelf");
      }
    } catch (error) {
      console.error("Failed to delete shelf:", error);
      return rejectWithValue("Failed to delete shelf");
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

export const updateShelf = createAsyncThunk(
  'lexigraph/updateShelf',
  async ({ 
    shelfId, 
    updates,
    principal
  }: { 
    shelfId: string, 
    updates: {
      title?: string,
      description?: string,
      slots?: Slot[]
    },
    principal: Principal
  }, { dispatch, rejectWithValue }) => {
    try {
      const lexigraphActor = await getActorLexigraph();
      
      // Convert to the format expected by the Candid interface
      // Use proper types for opt values ([] or [value])
      const candid_updates: {
        title: [] | [string];
        description: [] | [string];
        slots: [] | [Slot[]];
      } = {
        title: updates.title ? [updates.title] : [],
        description: updates.description ? [updates.description] : [],
        slots: updates.slots ? [updates.slots] : []
      };
      
      const result = await lexigraphActor.update_shelf(
        shelfId,
        candid_updates
      );
      
      if ("Ok" in result) {
        // Reload shelves after updating
        dispatch(loadShelves(principal));
        return { shelfId, updates };
      } else {
        return rejectWithValue("Failed to update shelf");
      }
    } catch (error) {
      console.error("Failed to update shelf:", error);
      return rejectWithValue("Failed to update shelf");
    }
  }
);

export const getShelfPositionMetrics = createAsyncThunk(
  'lexigraph/getShelfPositionMetrics',
  async (shelfId: string, { rejectWithValue }) => {
    try {
      const lexigraphActor = await getActorLexigraph();
      const result = await lexigraphActor.get_shelf_position_metrics(shelfId);
      
      if ("Ok" in result) {
        return result.Ok;
      } else {
        return rejectWithValue("Failed to get shelf position metrics");
      }
    } catch (error) {
      console.error("Failed to get shelf position metrics:", error);
      return rejectWithValue("Failed to get shelf position metrics");
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

// Create the slice
const lexigraphSlice = createSlice({
  name: 'lexigraph',
  initialState,
  reducers: {
    setSelectedShelf: (state, action: PayloadAction<Shelf | null>) => {
      state.selectedShelf = action.payload;
    },
    clearError: (state) => {
      state.error = null;
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
        
        // Update the last timestamp for pagination
        state.lastTimestamp = lastTimestamp;
        state.publicLoading = false;
      })
      .addCase(loadRecentShelves.rejected, (state, action) => {
        state.publicLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { setSelectedShelf, clearError } = lexigraphSlice.actions;
export default lexigraphSlice.reducer;

// Selectors
export const selectShelves = (state: { lexigraph: LexigraphState }) => state.lexigraph.shelves;
export const selectPublicShelves = (state: { lexigraph: LexigraphState }) => state.lexigraph.publicShelves;
export const selectSelectedShelf = (state: { lexigraph: LexigraphState }) => state.lexigraph.selectedShelf;
export const selectLastTimestamp = (state: { lexigraph: LexigraphState }) => state.lexigraph.lastTimestamp;
export const selectLoading = (state: { lexigraph: LexigraphState }) => state.lexigraph.loading;
export const selectPublicLoading = (state: { lexigraph: LexigraphState }) => state.lexigraph.publicLoading;
export const selectError = (state: { lexigraph: LexigraphState }) => state.lexigraph.error;