import {
  ActionReducerMapBuilder,
  createSlice,
} from "@reduxjs/toolkit";
import { message } from "antd";
import getAccountAlexBalance from "./thunks/alexIcrc/getAccountAlexBalance";
import transferALEX from "./thunks/alexIcrc/transferALEX";
import transferICPFromUserWalletcanister from "./thunks/transferICPFromUserWallet";
// Define the interface for our node state
export interface AlexState {
  alexBal: string;
  loading: boolean;
  transferSuccess:boolean;
  error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: AlexState = {
  alexBal: "",
  loading: false,
  transferSuccess:false,
  error: null,
};

const alexSlice = createSlice({
  name: "alex",
  initialState,
  reducers: {
    flagHandler: (state) => {
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
        message.info("Processing ALEX transfer!");
        state.loading = true;
        state.error = null;
      })
      .addCase(transferALEX.fulfilled, (state, action) => {
        message.success("Successfully transfered!");
        state.transferSuccess = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(transferALEX.rejected, (state, action) => {
        message.error("Error while transfering ALEX");
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export default alexSlice.reducer;
