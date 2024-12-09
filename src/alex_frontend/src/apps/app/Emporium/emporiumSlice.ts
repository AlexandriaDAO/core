import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";
import listNft from "./thunks/listNft";
import { toast } from "sonner";
import getMarketListing from "./thunks/getMarketListing";
import buyNft from "./thunks/buyNft";
import cancelListedNft from "./thunks/cancelistedNft ";
import updateListing from "./thunks/updateListing";
import getUserListing from "./thunks/geUserListing";

export interface EmporiumState {
  loading: boolean;
  depositNftSuccess: Boolean;
  cancelListingSuccess: Boolean;
  updateListingSuccess: Boolean;
  buyNftSuccess: Boolean;
  userTokens: { tokenId: string; arweaveId: string }[];
  marketPlace: Record<
    string,
    { tokenId: string; arweaveId: string; price: string; owner: string }
  >;
  error: string | null;
}

// Define the initial state
const initialState: EmporiumState = {
  loading: false,
  depositNftSuccess: false,
  buyNftSuccess: false,
  updateListingSuccess: false,
  cancelListingSuccess: false,
  error: null,
  userTokens: [],
  marketPlace: {},
};

const emporiumSlice = createSlice({
  name: "emporium",
  initialState,
  reducers: {
    flagHandlerEmporium: (state) => {
      state.error = null;
      state.depositNftSuccess = false;
      state.cancelListingSuccess = false;
      state.buyNftSuccess = false;
      state.updateListingSuccess = false;
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
        toast.success("Fetched!");
      })
      .addCase(getUserIcrc7Tokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload);
      })
      .addCase(listNft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listNft.fulfilled, (state, action) => {
        state.loading = false;
        state.depositNftSuccess = true;
        state.error = null;
        toast.success("Listed!");
      })
      .addCase(listNft.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
        state.error = action.payload as string;
      })
      .addCase(getUserListing.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserListing.fulfilled, (state, action) => {
        state.loading = false;
        state.marketPlace = action.payload;
        toast.success("Fetched!");
      })
      .addCase(getUserListing.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
        state.error = action.payload as string;
      })
      .addCase(updateListing.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateListing.fulfilled, (state, action) => {
        state.loading = false;
        state.updateListingSuccess = true;
        toast.success("updated!");
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
        state.error = action.payload as string;
      })
      .addCase(cancelListedNft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelListedNft.fulfilled, (state, action) => {
        state.loading = false;
        state.cancelListingSuccess = true;
        state.error = null;
        toast.success("Canceled!");
      })
      .addCase(cancelListedNft.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
        state.error = action.payload as string;
      })
      .addCase(buyNft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyNft.fulfilled, (state, action) => {
        state.loading = false;
        state.buyNftSuccess = true;
        state.error = null;
        toast.success("Success, NFT transfered to your principal!");
      })
      .addCase(buyNft.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
        state.error = action.payload as string;
      })
      .addCase(getMarketListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMarketListing.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.marketPlace = action.payload; // Assign the object directly

        toast.success("Fetched!");
      })
      .addCase(getMarketListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload);
      });
  },
});
export const { flagHandlerEmporium } = emporiumSlice.actions;
export default emporiumSlice.reducer;
