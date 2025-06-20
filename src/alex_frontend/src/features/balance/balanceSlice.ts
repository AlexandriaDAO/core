import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import icpReducer from './icp/icpSlice';
import alexReducer from './alex/alexSlice';
import lbryReducer from './lbry/lbrySlice';

// Define the interface for main balance state
export interface BalanceState {
  // Global state properties
  total: number
  loading: boolean;
  error: string | null;
  lastRefresh: number | null;
}

// Define the initial state
const initialState: BalanceState = {
  total: -1,
  loading: false,
  error: null,
  lastRefresh: null,
};

const balanceSlice = createSlice({
  name: "balance",
  initialState,
  reducers: {
    
    clearError: (state) => {
      state.error = null;
    },
    setLastRefresh: (state) => {
      state.lastRefresh = Date.now();
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTotal: (state, action) => {
      state.total = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<BalanceState>) => {
    // Main balance slice doesn't handle specific balance actions
    // Sub-slices handle their own actions
  },
});

export const { clearError, setLastRefresh, setLoading, setTotal } = balanceSlice.actions;

// Create a custom root reducer that combines the main slice with sub-feature slices
const balanceReducer = (state: any = {}, action: any) => {
  // First get the state from the main balance slice
  const mainState = balanceSlice.reducer(state, action);

  // Then get states from the sub-slices
  const icpState = icpReducer(state?.icp, action);
  const alexState = alexReducer(state?.alex, action);
  const lbryState = lbryReducer(state?.lbry, action);

  // Return combined state with main properties at root level
  return {
    ...mainState,
    icp: icpState,
    alex: alexState,
    lbry: lbryState,
  };
};

export default balanceReducer;