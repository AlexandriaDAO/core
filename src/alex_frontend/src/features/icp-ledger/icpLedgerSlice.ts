import {
  ActionReducerMapBuilder,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import { message } from "antd";
import getIcpBal from "./thunks/getIcpBal";
import transferICP from "./thunks/transferICP";
// Define the interface for our node state
export interface icpLedgerState {
  accountBalance: string;
  subAccountBalance: string;
  loading: boolean;
  transferSuccess: boolean;
  error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: icpLedgerState = {
  accountBalance: "0",
  subAccountBalance: "0",
  loading: false,
  transferSuccess: false,
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
        message.info("Fetching ICP Balance");
        state.loading = true;
        state.error = null;
      })
      .addCase(getIcpBal.fulfilled, (state, action) => {
        message.success("Successfully fetched icp balance.");
        state.accountBalance = action.payload.formatedAccountBal;
        state.subAccountBalance = action.payload.formatedSubAccountBal;
        state.loading = false;
        state.error = null;
      })
      .addCase(getIcpBal.rejected, (state, action) => {
        message.error("Icp balance could not be fetched");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(transferICP.pending, (state) => {
        message.info("Processing transfer ");
        state.loading = true;
        state.error = null;
      })
      .addCase(transferICP.fulfilled, (state, action) => {
        message.success("Successfully transfered.");
        state.loading = false;
        state.transferSuccess=true;
        state.error = null;
      })
      .addCase(transferICP.rejected, (state, action) => {
        message.error("Error in transfer.");
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const { icpLedgerFlagHandler } = icpLedgerSlice.actions;
export default icpLedgerSlice.reducer;
