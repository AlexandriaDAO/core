import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Shelf } from '../../../../../../../declarations/lexigraph/lexigraph.did';
import { 
  loadShelves, 
  loadRecentShelves 
} from './lexigraphThunks';

// Define the state interface
export interface LexigraphState {
  shelves: Shelf[];
  publicShelves: Shelf[];
  selectedShelf: Shelf | null;
  lastTimestamp: string | undefined;  // String representation of BigInt timestamp
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

// // # REDUCER # // //
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
    // Add a reducer for updating a single shelf
    updateSingleShelf: (state, action: PayloadAction<Shelf>) => {
      const updatedShelf = action.payload;
      
      // Update in shelves array
      const index = state.shelves.findIndex(shelf => shelf.shelf_id === updatedShelf.shelf_id);
      if (index !== -1) {
        state.shelves[index] = updatedShelf;
      }
      
      // Update in publicShelves if present
      const publicIndex = state.publicShelves.findIndex(shelf => shelf.shelf_id === updatedShelf.shelf_id);
      if (publicIndex !== -1) {
        state.publicShelves[publicIndex] = updatedShelf;
      }
      
      // Update selected shelf if it's the same one
      if (state.selectedShelf && state.selectedShelf.shelf_id === updatedShelf.shelf_id) {
        state.selectedShelf = updatedShelf;
      }
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
        
        // Store the lastTimestamp as a string (already converted in the thunk)
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
export const { setSelectedShelf, clearError, updateSingleShelf } = lexigraphSlice.actions;
export default lexigraphSlice.reducer;

// Selectors
export const selectShelves = (state: { lexigraph: LexigraphState }) => state.lexigraph.shelves;
export const selectPublicShelves = (state: { lexigraph: LexigraphState }) => state.lexigraph.publicShelves;
export const selectSelectedShelf = (state: { lexigraph: LexigraphState }) => state.lexigraph.selectedShelf;
export const selectLastTimestamp = (state: { lexigraph: LexigraphState }) => state.lexigraph.lastTimestamp;
export const selectLoading = (state: { lexigraph: LexigraphState }) => state.lexigraph.loading;
export const selectPublicLoading = (state: { lexigraph: LexigraphState }) => state.lexigraph.publicLoading;
export const selectError = (state: { lexigraph: LexigraphState }) => state.lexigraph.error;