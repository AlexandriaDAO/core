import {
  ActionReducerMapBuilder,
  createSlice,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import getAccountAlexBalance from "./thunks/alexIcrc/getAccountAlexBalance";
import transferALEX from "./thunks/alexIcrc/transferALEX";
import getAlexFee from "./thunks/alexIcrc/getAlexFee";
import getAlexPrice from "./thunks/alexIcrc/getAlexPrice";
// Define the interface for our node state
export interface AlexState {
  alexBal: string;
  alexFee:string;
  loading: boolean;
  transferSuccess:boolean;
  alexPriceUsd:string;
  error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: AlexState = {
  alexBal: "0",
  loading: false,
  alexPriceUsd:"0",
  transferSuccess:false,
  alexFee:"0",
  error: null,
};

const alexSlice = createSlice({
  name: "alex",
  initialState,
  reducers: {
    alexFlagHandler: (state) => {
      state.transferSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AlexState>) => {
    builder
      .addCase(getAccountAlexBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccountAlexBalance.fulfilled, (state, action) => {
        state.alexBal = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAccountAlexBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(transferALEX.pending, (state) => {
        toast.info("Processing ALEX transfer!");
        state.loading = true;
        state.error = null;
      })
      .addCase(transferALEX.fulfilled, (state, action) => {
        toast.success("Successfully transfered!");
        state.transferSuccess = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(transferALEX.rejected, (state, action) => {
        toast.error("Error while transfering ALEX");
        state.loading = false;
        state.error = action.payload as string;
      }).addCase(getAlexFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAlexFee.fulfilled, (state, action) => {
        state.alexFee = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAlexFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      }).addCase(getAlexPrice.fulfilled, (state, action) => {
        state.alexPriceUsd = action.payload;
        state.loading = false;
      })
      .addCase(getAlexPrice.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAlexPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get ALEX/USD price!";
      })
  },
});
export const { alexFlagHandler } = alexSlice.actions;
export default alexSlice.reducer;
