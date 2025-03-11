import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";
import listNft from "./thunks/listNft";
import { toast } from "sonner";
import getMarketListing from "./thunks/getMarketListing";
import buyNft from "./thunks/buyNft";
import removeListedNft from "./thunks/removeListedNft";
import editListing from "./thunks/editListing";
import getUserLogs from "./thunks/getUserLog";
import { TransformedLog } from "./utlis";
import getEmporiumLogs from "./thunks/getEmporiumMarketLogs";

export interface EmporiumState {
  loading: boolean;
  totalPages: number;
  pageSize: number;
  depositNftSuccess: Boolean;
  removeListingSuccess: Boolean;
  editListingSuccess: Boolean;
  buyNftSuccess: Boolean;
  userTokens: { tokenId: string; arweaveId: string }[];
  search: { search: string; pageSize: number; sort: string; type: string };
  totalCount: number;
  marketPlace: Record<
    string,
    { tokenId: string; arweaveId: string; price: string; owner: string }
  >;
  userLogs: {
    logs: TransformedLog[];
    pageSize: string;
    totalPages: string;
    currentPage: string;
  };
  emporiumMarketLogs: {
    logs: TransformedLog[];
    pageSize: string;
    totalPages: string;
    currentPage: string;
  };

  error: string | null;
}

// Define the initial state
const initialState: EmporiumState = {
  loading: false,
  depositNftSuccess: false,
  buyNftSuccess: false,
  editListingSuccess: false,
  removeListingSuccess: false,
  totalCount: 0,
  search: { search: "", pageSize: 8, sort: "", type: "token" },
  totalPages: 0,
  pageSize: 0,
  error: null,
  userTokens: [],
  marketPlace: {},
  userLogs: { logs: [], pageSize: "0", totalPages: "0", currentPage: "0" },
  emporiumMarketLogs: { logs: [], pageSize: "0", totalPages: "0", currentPage: "0" },
};

const emporiumSlice = createSlice({
  name: "emporium",
  initialState,
  reducers: {
    flagHandlerEmporium: (state) => {
      state.error = null;
      state.depositNftSuccess = false;
      state.removeListingSuccess = false;
      state.buyNftSuccess = false;
      state.editListingSuccess = false;
    },
    setSearchEmporium: (state, action) => {
      state.search = action.payload;
    },
    resetPagination: (state) => {
      state.totalPages = 0;
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
        state.totalPages = 0;
        state.loading = false;
        state.error = null;
        //toast.success("Fetched!");
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
      .addCase(editListing.pending, (state) => {
        state.loading = true;
      })
      .addCase(editListing.fulfilled, (state, action) => {
        state.loading = false;
        state.editListingSuccess = true;

        const { nftArweaveId, price } = action.payload;

        if (state.marketPlace[nftArweaveId]) {
          // Update the price in the marketplace
          state.marketPlace[nftArweaveId].price = price;
          toast.success("Price updated!");
        } else {
          toast.error("Listing not found!");
        }
      })
      .addCase(editListing.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
        state.error = action.payload as string;
      })
      .addCase(removeListedNft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeListedNft.fulfilled, (state, action) => {
        state.loading = false;
        state.removeListingSuccess = true;
        state.error = null;
        toast.success("Removed!");
        if (state.totalCount === 1) {
          state.totalPages = state.totalPages - 1;
        }
      })
      .addCase(removeListedNft.rejected, (state, action) => {
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
        state.totalCount = action.payload.totalCount;
        state.totalPages = Number(action.payload.totalPages);
        state.pageSize = Number(action.payload.pageSize);
        state.marketPlace = action.payload.nfts; // Assign the object directly
        if (Number(action.payload.totalPages) === 0) {
          toast.warning("No Nfts for sale!");
        }
        // toast.success("Fetched!");
      })
      .addCase(getMarketListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload);
      })
      .addCase(getUserLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserLogs.fulfilled, (state, action) => {
        (state.userLogs = {
          logs: action.payload.logs,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
        }),
          (state.loading = false);
        state.error = null;
        //toast.success("Fetched!");
      })
      .addCase(getUserLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload);
      })
      .addCase(getEmporiumLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmporiumLogs.fulfilled, (state, action) => {
        (state.emporiumMarketLogs = {
          logs: action.payload.logs,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
        }),
          (state.loading = false);
        state.error = null;
        //toast.success("Fetched!");
      })
      .addCase(getEmporiumLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload);
      });
  },
});
export const { flagHandlerEmporium, setSearchEmporium, resetPagination } =
  emporiumSlice.actions;
export default emporiumSlice.reducer;
