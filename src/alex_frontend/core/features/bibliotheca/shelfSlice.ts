import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ShelfBook } from "./types";
import { fetchShelfBookNFTs as fetchShelfBookNFTsAPI, ShelfBookResponse } from "./api/fetchShelfBookNFTs";

export interface ShelfState {
  books: ShelfBook[];
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

const initialState: ShelfState = {
  books: [],
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

// Async thunk for fetching user's listed book NFTs (following marketSlice pattern)
export const fetchShelfBookNFTs = createAsyncThunk<
  ShelfBookResponse & { appendMode?: boolean },
  { userPrincipal: string; page?: number; pageSize?: number; appendMode?: boolean },
  { rejectValue: string }
>(
  "bibliotheca/shelf/fetchShelfBookNFTs",
  async ({ userPrincipal, page = 1, pageSize = 8, appendMode = false }, { rejectWithValue, signal }) => {
    try {
      console.log("Shelf: Fetching user's listed book NFTs, user:", userPrincipal, "page:", page, "pageSize:", pageSize);
      
      // Fetch user's marketplace listings using our corrected API
      const result = await fetchShelfBookNFTsAPI({ userPrincipal, page, pageSize, signal });
      
      console.log("Shelf slice: API returned", result.books.length, "book NFTs");

      return {
        ...result,
        appendMode
      };
    } catch (error) {
      console.error("Error fetching shelf book NFTs:", error);
      return rejectWithValue("Failed to fetch shelf book NFTs");
    }
  }
);

const shelfSlice = createSlice({
  name: "bibliotheca/shelf",
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
    resetShelf: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShelfBookNFTs.pending, (state, action) => {
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
      .addCase(fetchShelfBookNFTs.fulfilled, (state, action) => {
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
      .addCase(fetchShelfBookNFTs.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload || "Failed to fetch shelf book NFTs";
      });
  },
});

export const { setPage, setEditing, setUnlisting, clearError, resetShelf } = shelfSlice.actions;
export default shelfSlice.reducer;