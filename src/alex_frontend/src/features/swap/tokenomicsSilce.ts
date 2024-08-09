import {
  ActionReducerMapBuilder,
  createSlice,
} from "@reduxjs/toolkit";
import { message } from "antd";
import getAlexMintRate from "./thunks/tokenomics/getAlexMintRate";
// Define the interface for our node state
export interface SwapState {
  alexMintRate: string;
  loading: boolean;
  error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: SwapState = {
  alexMintRate: "",
  loading: false,
  error: null,
};

const tokenomicsSlice = createSlice({
  name: "tokenomics",
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<SwapState>) => {
    builder
      .addCase(getAlexMintRate.pending, (state) => {
        message.info("Fetching ALEX mint rate!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getAlexMintRate.fulfilled, (state, action) => {
        message.success("Fetched ALEX mint rate!");
        state.alexMintRate = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAlexMintRate.rejected, (state, action) => {
        message.error("Could not fetched ALEX mint rate!");
        state.loading = false;
        state.error = action.payload as string;
      })
    
  },
});

export default tokenomicsSlice.reducer;
