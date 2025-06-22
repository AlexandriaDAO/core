import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import unlocked from './thunks/unlocked';
import locked from './thunks/locked';
import burn from './thunks/burn';
import ratio from './thunks/ratio';
import fee from './thunks/fee';

export interface LbryBalanceState {
  unlocked: number;
  unlockedLoading: boolean;
  unlockedError: string | null;

  locked: number;
  lockedLoading: boolean;
  lockedError: string | null;

  burning: boolean;
  burnError: string | null;

  ratio: number;
  ratioLoading: boolean;
  ratioError: string | null;

  fee: number;
  feeLoading: boolean;
  feeError: string | null;

  lastRefresh: number | null;
}

const initialState: LbryBalanceState = {
  unlocked: -1,
  unlockedLoading: false,
  unlockedError: null,

  locked: -1,
  lockedLoading: false,
  lockedError: null,

  burning: false,
  burnError: null,

  ratio: -1,
  ratioLoading: false,
  ratioError: null,

  fee: -1,
  feeLoading: false,
  feeError: null,

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
    clearBurnError: (state) => {
      state.burnError = null;
    },
    clearRatioError: (state) => {
      state.ratioError = null;
    },
    clearFeeError: (state) => {
      state.feeError = null;
    },
    clearAllErrors: (state) => {
      state.unlockedError = null;
      state.lockedError = null;
      state.burnError = null;
      state.ratioError = null;
      state.feeError = null;
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
      })

      // LBRY Burn
      .addCase(burn.pending, (state) => {
        state.burning = true;
        state.burnError = null;
      })
      .addCase(burn.fulfilled, (state) => {
        state.burning = false;
        state.burnError = null;
        toast.success("Successfully burned LBRY tokens");
      })
      .addCase(burn.rejected, (state, action) => {
        state.burning = false;
        state.burnError = action.payload || "Failed to burn LBRY tokens";
      })

      // LBRY Ratio
      .addCase(ratio.pending, (state) => {
        state.ratioLoading = true;
        state.ratioError = null;
      })
      .addCase(ratio.fulfilled, (state, action) => {
        state.ratio = action.payload;
        state.ratioLoading = false;
        state.ratioError = null;
      })
      .addCase(ratio.rejected, (state, action) => {
        state.ratioLoading = false;
        state.ratioError = action.payload || "Failed to fetch LBRY ratio";
        state.ratio = -1;
      })

      // LBRY Fee
      .addCase(fee.pending, (state) => {
        state.feeLoading = true;
        state.feeError = null;
      })
      .addCase(fee.fulfilled, (state, action) => {
        state.fee = action.payload;
        state.feeLoading = false;
        state.feeError = null;
        state.lastRefresh = Date.now();
      })
      .addCase(fee.rejected, (state, action) => {
        state.feeLoading = false;
        state.feeError = action.payload || "Failed to fetch LBRY fee";
        state.fee = -1;
      });
  },
});

export const { clearUnlockedError, clearLockedError, clearBurnError, clearRatioError, clearFeeError, clearAllErrors, setLastRefresh } = lbrySlice.actions;
export default lbrySlice.reducer;