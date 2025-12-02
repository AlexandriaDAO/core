import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { MarketAudio } from "./types";
import { fetchMarketAudioNFTs as fetchMarketAudioNFTsAPI, MarketAudioResponse } from "./api/fetchMarketAudioNFTs";

export interface MarketState {
  audios: MarketAudio[];
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
  audios: [],
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

// Async thunk for fetching marketplace audio NFTs (following archiveSlice pattern)
export const fetchMarketAudioNFTs = createAsyncThunk<
  MarketAudioResponse & { appendMode?: boolean },
  { page?: number; pageSize?: number; appendMode?: boolean; currentUserPrincipal?: string },
  { rejectValue: string }
>(
  "sonora/market/fetchMarketAudioNFTs",
  async ({ page = 1, pageSize = 8, appendMode = false, currentUserPrincipal }, { rejectWithValue, signal }) => {
    try {
      console.log("Market: Fetching marketplace audio NFTs, page:", page, "pageSize:", pageSize, "excluding user:", currentUserPrincipal);
      
      // Fetch marketplace audio NFTs using our API
      const result = await fetchMarketAudioNFTsAPI({ page, pageSize, currentUserPrincipal, signal });
      
      console.log("Market slice: API returned", result.audios.length, "audio NFTs");

      return {
        ...result,
        appendMode
      };
    } catch (error) {
      console.error("Error fetching market audio NFTs:", error);
      return rejectWithValue("Failed to fetch market audio NFTs");
    }
  }
);

const marketSlice = createSlice({
  name: "sonora/market",
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
      .addCase(fetchMarketAudioNFTs.pending, (state, action) => {
        const { appendMode } = action.meta.arg;
        if (appendMode) {
          state.loadingMore = true;
        } else {
          // Only show full loading if there are no existing audios
          if (state.audios.length === 0) {
            state.loading = true;
          } else {
            state.loadingMore = true;
          }
        }
        state.error = null;
      })
      .addCase(fetchMarketAudioNFTs.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        
        if (action.payload.appendMode) {
          // Append to existing audios
          state.audios = [...state.audios, ...action.payload.audios];
        } else {
          // Replace audios (first page or refresh)
          state.audios = action.payload.audios;
        }
        
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
        };
        state.error = null;
      })
      .addCase(fetchMarketAudioNFTs.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload || "Failed to fetch market audio NFTs";
      });
  },
});

export const { setPage, setPurchasing, clearError, resetMarket } = marketSlice.actions;
export default marketSlice.reducer;