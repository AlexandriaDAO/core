import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";
export interface EmporiumState {
  loading: boolean;
  userTokens: string[];
  error: string | null;
}

// Define the initial state
const initialState: EmporiumState = {
  loading: false,
  error: null,
  userTokens: [],
};

const emporiumSlice = createSlice({
  name: "emporium",
  initialState,
  reducers: {
    flagHandler: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<EmporiumState>) => {
    builder
      .addCase(getUserIcrc7Tokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserIcrc7Tokens.fulfilled, (state, action) => {
        state.userTokens = action.payload.length > 0 ? action.payload : [];
        state.loading = false;
        state.error = null;
      })
      .addCase(getUserIcrc7Tokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const { flagHandler } = emporiumSlice.actions;
export default emporiumSlice.reducer;
