import {
  ActionReducerMapBuilder,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import { message } from "antd";
import getAccountAlexBalance from "./thunks/alexIcrc/getAccountAlexBalance";
// Define the interface for our node state
export interface AlexState {
  alexBal: string;
  loading: boolean;
  error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: AlexState = {
  alexBal: "",
  loading: false,
  error: null,
};

const alexSlice = createSlice({
  name: "alex",
  initialState,
  reducers: {},
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
  },
});

export default alexSlice.reducer;
