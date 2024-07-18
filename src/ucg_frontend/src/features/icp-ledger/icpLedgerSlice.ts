import {
  ActionReducerMapBuilder,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import { message } from "antd";
import getIcpBal from "./thunks/getIcpBal";
// Define the interface for our node state
export interface icpLedgerState {
  balance:string;
  loading: boolean;
  error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: icpLedgerState = {
  balance: "",
  loading: false,
  error: null,
};

const icpLedgerSlice = createSlice({
  name: "icpLedgerSlice",
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<icpLedgerState>) => {
    builder
      .addCase(getIcpBal.pending, (state) => {
        message.info("Fetching ICP Balance");
        state.loading = true;
        state.error = null;
      })
      .addCase(getIcpBal.fulfilled, (state, action) => {
        message.success("Successfully fetched icp balance.");
        state.balance = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getIcpBal.rejected, (state, action) => {
        message.error("Icp balance could not be fetched");
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default icpLedgerSlice.reducer;
