import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ArchiveAudio } from "./types";
import { fetchUserAudioNFTs as fetchUserAudioNFTsAPI, UserAudioResponse } from "./api/fetchUserAudioNFTs";

export interface ArchiveState {
  audios: ArchiveAudio[];
  loading: boolean;
  loadingMore: boolean; // For append mode
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
  selling: string; // arweave_id, empty string for no selection
}

const initialState: ArchiveState = {
  audios: [],
  loading: false,
  loadingMore: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false,
  },
  selling: '',
};

// Async thunk for fetching user's audio NFTs
export const fetchUserAudioNFTs = createAsyncThunk<
  UserAudioResponse & { appendMode?: boolean },
  { userPrincipal: string; page?: number; pageSize?: number; appendMode?: boolean },
  { rejectValue: string }
>(
  "archive/fetchUserAudioNFTs",
  async ({ userPrincipal, page = 1, pageSize = 8, appendMode = false }, { rejectWithValue, signal }) => {
    try {
      console.log("Fetching audio NFTs for user:", userPrincipal);
      
      // Fetch real audio NFTs from the blockchain
      const result = await fetchUserAudioNFTsAPI({ userPrincipal, page, pageSize, signal });
      
      return {
        ...result,
        appendMode
      };
    } catch (error) {
      console.error("Error fetching user audio NFTs:", error);
      if (error instanceof Error && error.message === 'AbortError') {
        throw error; // Re-throw abort errors
      }
      return rejectWithValue("Failed to fetch user audio NFTs");
    }
  }
);

const archiveSlice = createSlice({
  name: "archive",
  initialState,
  reducers: {
    setSelling: (state, action) => {
      state.selling = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetArchive: (state) => {
      state.audios = [];
      state.loading = false;
      state.loadingMore = false;
      state.pagination = {
        page: 1,
        totalPages: 1,
        totalCount: 0,
        hasMore: false,
      };
      state.error = null;
      state.selling = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserAudioNFTs
      .addCase(fetchUserAudioNFTs.pending, (state, action) => {
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
      .addCase(fetchUserAudioNFTs.fulfilled, (state, action) => {
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
          hasMore: action.payload.hasMore,
        };
        state.error = null;
      })
      .addCase(fetchUserAudioNFTs.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload || "Failed to fetch user audio NFTs";
      });
  },
});

export const { setSelling, clearError, resetArchive } = archiveSlice.actions;
export default archiveSlice.reducer;