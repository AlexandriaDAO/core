import {
  ActionReducerMapBuilder,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import { message } from "antd";
import getLBRYratio from "./thunks/getLBRYratio";
import getSubaccount from "./thunks/getSubaccount";
import swapLbry from "./thunks/swapLbry";
import getMaxLbryBurn from "./thunks/getMaxLbryBurn";
import burnLbry from "./thunks/burnLBRY";
import getLbryBalance from "./thunks/getLbryBalance";
// Define the interface for our node state
export interface SwapState {
  lbryRatio: string;
  lbryBalance: string;
  subaccount: string;
  maxLbryBurn: Number;
  loading: boolean;
  success: boolean;
  error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: SwapState = {
  lbryRatio: "0",
  lbryBalance: "0",
  subaccount: "",
  maxLbryBurn: 0,
  success: false,
  loading: false,
  error: null,
};

const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    flagHandler: (state) => {
      state.error = "";
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<SwapState>) => {
    builder
      .addCase(getLBRYratio.pending, (state) => {
        message.info("fetching LBRY ratio");
        state.loading = true;
        state.error = null;
      })
      .addCase(getLBRYratio.fulfilled, (state, action) => {
        message.success("Fetched.");
        state.lbryRatio = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getLBRYratio.rejected, (state, action) => {
        message.error("Could not be fetched");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getLbryBalance.pending, (state) => {
        message.info("Fetching LBRY Balance");
        state.loading = true;
        state.error = null;
      })
      .addCase(getLbryBalance.fulfilled, (state, action) => {
        message.success("Fetched LBRY Balance.");
        state.lbryBalance = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getLbryBalance.rejected, (state, action) => {
        message.error("Could not be fetched");
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getSubaccount.pending, (state) => {
        message.info("Fetching subaccount ratio");
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubaccount.fulfilled, (state, action) => {
        message.success("Fetched.");
        state.subaccount = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getSubaccount.rejected, (state, action) => {
        message.error("Subaccount could not be fetched");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(swapLbry.pending, (state) => {
        message.info("Swapping");
        state.loading = true;
        state.error = null;
      })
      .addCase(swapLbry.fulfilled, (state, action) => {
        message.success("Successfully Swaped!");
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(swapLbry.rejected, (state, action) => {
        message.error("Error while Swaping");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(burnLbry.pending, (state) => {
        message.info("Burning Lbry");
        state.loading = true;
        state.error = null;
      })
      .addCase(burnLbry.fulfilled, (state, action) => {
        message.success("Success.");
        state.loading = false;
        state.error = null;
      })
      .addCase(burnLbry.rejected, (state, action) => {
        message.error("Error while burning");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getMaxLbryBurn.pending, (state) => {
        message.info("Fetching max allowed lbry burn!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaxLbryBurn.fulfilled, (state, action) => {
        message.success("Successfully fetched max allowed burn!");
        state.maxLbryBurn = action.payload;
        state.error = null;
      })
      .addCase(getMaxLbryBurn.rejected, (state, action) => {
        message.error("Error while fethcing max burn lbry!");
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const { flagHandler } = swapSlice.actions;
export default swapSlice.reducer;
