import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { MarketBook } from "./types";
import { fetchMarketBookNFTs as fetchMarketBookNFTsAPI, MarketBookResponse } from "./api/fetchMarketBookNFTs";

export interface MarketState {
  books: MarketBook[];
  loading: boolean;
  loadingMore: boolean; // For append mode
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
  purchasing: string; // arweave_id for purchase actions
}

const initialState: MarketState = {
  books: [],
  loading: false,
  loadingMore: false,
  error: null,
  pagination: {
    page: 1, // API uses 1-based indexing (like marketplace)
    totalPages: 0,
    totalCount: 0,
  },
  purchasing: '',
};

// Async thunk for fetching marketplace book NFTs (following librarySlice pattern)
export const fetchMarketBookNFTs = createAsyncThunk<
  MarketBookResponse & { appendMode?: boolean },
  { page?: number; pageSize?: number; appendMode?: boolean; currentUserPrincipal?: string },
  { rejectValue: string }
>(
  "bibliotheca/market/fetchMarketBookNFTs",
  async ({ page = 1, pageSize = 8, appendMode = false, currentUserPrincipal }, { rejectWithValue, signal }) => {
    try {
      console.log("Market: Fetching marketplace book NFTs, page:", page, "pageSize:", pageSize, "excluding user:", currentUserPrincipal);
      
      // Fetch marketplace book NFTs using our API
      const result = await fetchMarketBookNFTsAPI({ page, pageSize, currentUserPrincipal, signal });
      
      console.log("Market slice: API returned", result.books.length, "book NFTs");

      return {
        ...result,
        appendMode
      };
    } catch (error) {
      console.error("Error fetching market book NFTs:", error);
      return rejectWithValue("Failed to fetch market book NFTs");
    }
  }
);

const marketSlice = createSlice({
  name: "bibliotheca/market",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setPurchasing: (state, action) => {
      state.purchasing = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetMarket: () => ({
      ...initialState,
      loading: false,
      loadingMore: false,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketBookNFTs.pending, (state, action) => {
        const { appendMode } = action.meta.arg;
        if (appendMode) {
          state.loadingMore = true;
        } else {
          // Only show full loading if there are no existing books
          if (state.books.length === 0) {
            state.loading = true;
          } else {
            state.loadingMore = true;
          }
        }
        state.error = null;
      })
      .addCase(fetchMarketBookNFTs.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        
        if (action.payload.appendMode) {
          // Append to existing books
          state.books = [...state.books, ...action.payload.books];
        } else {
          // Replace books (first page or refresh)
          state.books = action.payload.books;
        }
        
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
        };
        state.error = null;
      })
      .addCase(fetchMarketBookNFTs.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload || "Failed to fetch market book NFTs";
      });
  },
});

export const { setPage, setPurchasing, clearError, resetMarket } = marketSlice.actions;
export default marketSlice.reducer;