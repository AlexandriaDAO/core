import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { StudioAudio } from "./types";
import { fetchStudioAudioNFTs as fetchStudioAudioNFTsAPI, StudioAudioResponse } from "./api/fetchStudioAudioNFTs";

export interface StudioState {
  audios: StudioAudio[];
  loading: boolean;
  loadingMore: boolean; // For append mode
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
  editing: string; // arweave_id, empty string for no selection
  unlisting: string; // arweave_id, empty string for no selection
}

const initialState: StudioState = {
  audios: [],
  loading: false,
  loadingMore: false,
  error: null,
  pagination: {
    page: 1, // API uses 1-based indexing (like marketplace)
    totalPages: 0,
    totalCount: 0,
  },
  editing: '',
  unlisting: '',
};

// Async thunk for fetching user's listed audio NFTs (following marketSlice pattern)
export const fetchStudioAudioNFTs = createAsyncThunk<
  StudioAudioResponse & { appendMode?: boolean },
  { userPrincipal: string; page?: number; pageSize?: number; appendMode?: boolean },
  { rejectValue: string }
>(
  "studio/fetchStudioAudioNFTs",
  async ({ userPrincipal, page = 1, pageSize = 8, appendMode = false }, { rejectWithValue, signal }) => {
    try {
      console.log("Studio: Fetching user's listed audio NFTs, user:", userPrincipal, "page:", page, "pageSize:", pageSize);
      
      // Fetch user's marketplace listings using our corrected API
      const result = await fetchStudioAudioNFTsAPI({ userPrincipal, page, pageSize, signal });
      
      console.log("Studio slice: API returned", result.audios.length, "audio NFTs");

      return {
        ...result,
        appendMode
      };
    } catch (error) {
      console.error("Error fetching studio audio NFTs:", error);
      return rejectWithValue("Failed to fetch studio audio NFTs");
    }
  }
);

const studioSlice = createSlice({
  name: "studio",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setEditing: (state, action) => {
      state.editing = action.payload;
    },
    setUnlisting: (state, action) => {
      state.unlisting = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetStudio: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudioAudioNFTs.pending, (state, action) => {
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
      .addCase(fetchStudioAudioNFTs.fulfilled, (state, action) => {
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
      .addCase(fetchStudioAudioNFTs.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload || "Failed to fetch studio audio NFTs";
      });
  },
});

export const { setPage, setEditing, setUnlisting, clearError, resetStudio } = studioSlice.actions;
export default studioSlice.reducer;