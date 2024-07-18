import {
  ActionReducerMapBuilder,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import { message } from "antd";
import getUcgMintRate from "./thunks/tokenomics/getUcgMintRate";
// Define the interface for our node state
export interface SwapState {
  ucgMintRate: Number;
  loading: boolean;
  error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: SwapState = {
  ucgMintRate: 0,
  loading: false,
  error: null,
};

const tokenomicsSlice = createSlice({
  name: "tokenomics",
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<SwapState>) => {
    builder
      .addCase(getUcgMintRate.pending, (state) => {
        message.info("Fetching UCG mint rate");
        state.loading = true;
        state.error = null;
      })
      .addCase(getUcgMintRate.fulfilled, (state, action) => {
        message.success("Fetched UCG mint rate.");
        state.ucgMintRate = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUcgMintRate.rejected, (state, action) => {
        message.error("Could not fetched UCG mint rate");
        state.loading = false;
        state.error = action.payload as string;
      })
    
  },
});

export default tokenomicsSlice.reducer;
