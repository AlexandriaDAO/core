import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import icpReducer from './icp/icpSlice';
import alexReducer from './alex/alexSlice';
import lbryReducer from './lbry/lbrySlice';
import amount from './thunks/amount';
import archived from './thunks/archived';
import unclaimed from './thunks/unclaimed';

// Define the interface for main balance state
export interface BalanceState {
  // Global state properties
  total: number
  loading: boolean;
  error: string | null;
  lastRefresh: number | null;

  // maxBurnAllowed
  burnable: number;

  // Canister balance states
  amount: number;
  amountLoading: boolean;
  amountError: string | null;

  archived: number;
  archivedLoading: boolean;
  archivedError: string | null;

  unclaimed: number;
  unclaimedLoading: boolean;
  unclaimedError: string | null;
}

// Define the initial state
const initialState: BalanceState = {
  total: -1,
  loading: false,
  error: null,
  lastRefresh: null,

  burnable: -1,

  amount: -1,
  amountLoading: false,
  amountError: null,

  archived: -1,
  archivedLoading: false,
  archivedError: null,

  unclaimed: -1,
  unclaimedLoading: false,
  unclaimedError: null,
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
    setBurnable: (state, action)=>{
      state.burnable = action.payload
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<BalanceState>) => {
    builder
      // Canister Amount (Balance)
      .addCase(amount.pending, (state) => {
        state.amountLoading = true;
        state.amountError = null;
      })
      .addCase(amount.fulfilled, (state, action) => {
        state.amount = action.payload;
        state.amountLoading = false;
        state.amountError = null;
      })
      .addCase(amount.rejected, (state, action) => {
        state.amountLoading = false;
        state.amountError = action.payload as string;
        state.amount = -1;
      })

      // Canister Archived
      .addCase(archived.pending, (state) => {
        state.archivedLoading = true;
        state.archivedError = null;
      })
      .addCase(archived.fulfilled, (state, action) => {
        state.archived = action.payload;
        state.archivedLoading = false;
        state.archivedError = null;
      })
      .addCase(archived.rejected, (state, action) => {
        state.archivedLoading = false;
        state.archivedError = action.payload as string;
        state.archived = -1;
      })

      // Canister Unclaimed
      .addCase(unclaimed.pending, (state) => {
        state.unclaimedLoading = true;
        state.unclaimedError = null;
      })
      .addCase(unclaimed.fulfilled, (state, action) => {
        state.unclaimed = action.payload;
        state.unclaimedLoading = false;
        state.unclaimedError = null;
      })
      .addCase(unclaimed.rejected, (state, action) => {
        state.unclaimedLoading = false;
        state.unclaimedError = action.payload as string;
        state.unclaimed = -1;
      });
  },
});

export const { clearError, setLastRefresh, setLoading, setTotal, setBurnable } = balanceSlice.actions;

// Create a custom root reducer that combines the main slice with sub-feature slices
const balanceReducer = (state: any = {}, action: any) => {
  // Check if this is the initial empty state
  const isInitialState = Object.keys(state).length === 0;
  
  // Extract the main state properties (excluding nested reducers)
  const { icp, alex, lbry, ...mainStateProps } = state;
  
  // For initial state, pass undefined to get proper initial values
  // Otherwise, pass the current main state props
  const mainState = balanceSlice.reducer(
    isInitialState ? undefined : mainStateProps, 
    action
  );

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