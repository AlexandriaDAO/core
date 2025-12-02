import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LibraryBook } from "./types";
import { fetchUserBookNFTs as fetchUserBookNFTsAPI, UserBookResponse } from "./api/fetchUserBookNFTs";

export interface LibraryState {
  books: LibraryBook[];
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

const initialState: LibraryState = {
  books: [],
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

// Async thunk for fetching user's book NFTs
export const fetchUserBookNFTs = createAsyncThunk<
  UserBookResponse & { appendMode?: boolean },
  { userPrincipal: string; page?: number; pageSize?: number; appendMode?: boolean },
  { rejectValue: string }
>(
  "bibliotheca/library/fetchUserBookNFTs",
  async ({ userPrincipal, page = 1, pageSize = 8, appendMode = false }, { rejectWithValue, signal }) => {
    try {
      console.log("Fetching book NFTs for user:", userPrincipal);
      
      // Fetch real book NFTs from the blockchain
      const result = await fetchUserBookNFTsAPI({ userPrincipal, page, pageSize, signal });
      
      return {
        ...result,
        appendMode
      };
    } catch (error) {
      console.error("Error fetching user book NFTs:", error);
      if (error instanceof Error && error.message === 'AbortError') {
        throw error; // Re-throw abort errors
      }
      return rejectWithValue("Failed to fetch user book NFTs");
    }
  }
);

const librarySlice = createSlice({
  name: "bibliotheca/library",
  initialState,
  reducers: {
    setSelling: (state, action) => {
      state.selling = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetLibrary: (state) => {
      state.books = [];
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
      // fetchUserBookNFTs
      .addCase(fetchUserBookNFTs.pending, (state, action) => {
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
      .addCase(fetchUserBookNFTs.fulfilled, (state, action) => {
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
          hasMore: action.payload.hasMore,
        };
        state.error = null;
      })
      .addCase(fetchUserBookNFTs.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload || "Failed to fetch user book NFTs";
      });
  },
});

export const { setSelling, clearError, resetLibrary } = librarySlice.actions;
export default librarySlice.reducer;