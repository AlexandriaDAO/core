import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import unlocked from './thunks/unlocked';
import locked from './thunks/locked';

export interface LbryBalanceState {
  unlocked: number;
  unlockedLoading: boolean;
  unlockedError: string | null;

  locked: number;
  lockedLoading: boolean;
  lockedError: string | null;

  lastRefresh: number | null;
}

const initialState: LbryBalanceState = {
  unlocked: -1,
  unlockedLoading: false,
  unlockedError: null,

  locked: -1,
  lockedLoading: false,
  lockedError: null,

  lastRefresh: null,
};

const lbrySlice = createSlice({
  name: "balance/lbry",
  initialState,
  reducers: {
    clearUnlockedError: (state) => {
      state.unlockedError = null;
    },
    clearLockedError: (state) => {
      state.lockedError = null;
    },
    clearAllErrors: (state) => {
      state.unlockedError = null;
      state.lockedError = null;
    },
    setLastRefresh: (state) => {
      state.lastRefresh = Date.now();
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<LbryBalanceState>) => {
    builder
      // LBRY Balance
      .addCase(unlocked.pending, (state) => {
        state.unlockedLoading = true;
        state.unlockedError = null;
      })
      .addCase(unlocked.fulfilled, (state, action) => {
        state.unlocked = action.payload;
        state.unlockedLoading = false;
        state.unlockedError = null;
        state.lastRefresh = Date.now();
      })
      .addCase(unlocked.rejected, (state, action) => {
        state.unlockedLoading = false;
        state.unlockedError = action.payload as string;
        state.unlocked = -1;
        toast.error("Failed to fetch LBRY balance");
      })

      // LBRY Locked Balance
      .addCase(locked.pending, (state) => {
        state.lockedLoading = true;
        state.lockedError = null;
      })
      .addCase(locked.fulfilled, (state, action) => {
        state.locked = action.payload;
        state.lockedLoading = false;
        state.lockedError = null;
        state.lastRefresh = Date.now();
      })
      .addCase(locked.rejected, (state, action) => {
        state.lockedLoading = false;
        state.lockedError = action.payload as string;
        state.locked = -1;
      });
  },
});

export const { clearUnlockedError, clearLockedError, clearAllErrors, setLastRefresh } = lbrySlice.actions;
export default lbrySlice.reducer;