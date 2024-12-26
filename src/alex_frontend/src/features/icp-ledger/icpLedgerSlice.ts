import {
  ActionReducerMapBuilder,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import getIcpBal from "./thunks/getIcpBal";
import transferICP from "./thunks/transferICP";
import getAccountId from "./thunks/getAccountId";
import getIcpPrice from "./thunks/getIcpPrice";
import getCanisterBal from "./thunks/getCanisterBal";
// Define the interface for our node state
export interface icpLedgerState {
  accountBalance: string;
  accountBalanceUSD: string;
  canisterBalance: string;
  loading: boolean;
  transferSuccess: boolean;
  accountId: string;
  icpPrice: Number;
  error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: icpLedgerState = {
  accountBalance: "0",
  accountBalanceUSD: "0",
  canisterBalance: "0",
  loading: false,
  transferSuccess: false,
  accountId: "N/A",
  icpPrice: 0,
  error: null,
};

const icpLedgerSlice = createSlice({
  name: "icpLedgerSlice",
  initialState,
  reducers: {
    icpLedgerFlagHandler: (state) => {
      state.error = "";
      state.transferSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<icpLedgerState>) => {
    builder
      .addCase(getIcpBal.pending, (state) => {
        // toast.info("Fetching ICP Balance");
        state.loading = true;
        state.error = null;
      })
      .addCase(getIcpBal.fulfilled, (state, action) => {
        // toast.success("Successfully fetched icp balance.");
        state.accountBalance = action.payload.formatedAccountBal;
        state.accountBalanceUSD = (
          Number(action.payload.formatedAccountBal) * Number(state.icpPrice)
        ).toFixed(4);
        state.loading = false;
        state.error = null;
      })
      .addCase(getIcpBal.rejected, (state, action) => {
        toast.error("Icp balance could not be fetched");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(transferICP.pending, (state) => {
        toast.info("Processing transfer ");
        state.loading = true;
        state.error = null;
      })
      .addCase(transferICP.fulfilled, (state, action) => {
        toast.success("Successfully transfered.");
        state.loading = false;
        state.transferSuccess = true;
        state.error = null;
      })
      .addCase(transferICP.rejected, (state, action) => {
        toast.error("Error in transfer.");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAccountId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccountId.fulfilled, (state, action) => {
        state.loading = false;
        state.accountId = action.payload;
        state.error = null;
      })
      .addCase(getAccountId.rejected, (state, action) => {
        toast.error("Error in accountId.");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getIcpPrice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIcpPrice.fulfilled, (state, action) => {
        state.loading = false;
        state.icpPrice = action.payload;
        state.accountBalanceUSD = (
          Number(state.accountBalance) * Number(action.payload)
        ).toFixed(4);
        state.error = null;
      })
      .addCase(getIcpPrice.rejected, (state, action) => {
        toast.error("Error while fetching ICP price!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getCanisterBal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCanisterBal.fulfilled, (state, action) => {
        state.canisterBalance = action.payload.formatedAccountBal;
        state.loading = false;
        state.error = null;
      })
      .addCase(getCanisterBal.rejected, (state, action) => {
        toast.error("Canister balance could not be fetched!");
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const { icpLedgerFlagHandler } = icpLedgerSlice.actions;
export default icpLedgerSlice.reducer;
