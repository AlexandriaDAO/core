import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from "../types/queries";
import { fileTypeCategories } from "../types/files";
import { fetchRecentTransactions, fetchTransactionsByIds } from "./ArweaveQueries";

// Define the state type
interface SearchState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  lastTimestamp: number;
  contentTypes: string[];
  amount: number;
  ownerFilter: string;
  minBlock?: number;
  maxBlock?: number;
  contentCategory: string;
  contentType: string;
  filterDate: string;
  filterTime: string;
  advancedOptionsOpen: boolean;
}

// Initial state
const initialState: SearchState = {
  transactions: [],
  isLoading: false,
  error: null,
  lastTimestamp: 0,
  contentTypes: [],
  amount: 12,
  ownerFilter: '',
  contentCategory: 'images',
  contentType: '',
  filterDate: '',
  filterTime: '00:00',
  advancedOptionsOpen: false,
};

// Create the async thunk
export const performSearch = createAsyncThunk(
  'arweave/performSearch',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { arweaveSearch: SearchState };
    const {
      contentType, contentCategory, advancedOptionsOpen,
      amount, filterDate, filterTime, ownerFilter,
      minBlock, maxBlock
    } = state.arweaveSearch;

    try {
      let maxTimestamp: number | undefined;

      if (filterDate) {
        const userDateTime = new Date(`${filterDate}T${filterTime || "00:00"}:00Z`);
        maxTimestamp = Math.floor(userDateTime.getTime() / 1000);
      }

      let contentTypes: string[] = [];

      if (advancedOptionsOpen && contentType) {
        contentTypes = [contentType];
      } else if (contentCategory && contentCategory !== "") {
        contentTypes = fileTypeCategories[contentCategory] || [];
      }

      const fetchedTransactions = await fetchRecentTransactions(
        contentTypes,
        amount,
        maxTimestamp,
        ownerFilter || undefined,
        minBlock,
        maxBlock
      );

      const lastTimestamp = fetchedTransactions.length > 0
        ? fetchedTransactions[fetchedTransactions.length - 1].block?.timestamp || 0
        : 0;

      return { 
        transactions: fetchedTransactions, 
        lastTimestamp, 
        contentTypes 
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch transactions');
    }
  }
);

// Create the slice
const arweaveSearchSlice = createSlice({
  name: 'arweaveSearch',
  initialState,
  reducers: {
    setContentCategory: (state, action: PayloadAction<string>) => {
      state.contentCategory = action.payload;
    },
    setAdvancedOptionsOpen: (state, action: PayloadAction<boolean>) => {
      state.advancedOptionsOpen = action.payload;
    },
    setAmount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
    },
    setFilterDate: (state, action: PayloadAction<string>) => {
      state.filterDate = action.payload;
    },
    setFilterTime: (state, action: PayloadAction<string>) => {
      state.filterTime = action.payload;
    },
    setOwnerFilter: (state, action: PayloadAction<string>) => {
      state.ownerFilter = action.payload;
    },
    setContentType: (state, action: PayloadAction<string>) => {
      state.contentType = action.payload;
    },
    setMinBlock: (state, action: PayloadAction<number | undefined>) => {
      state.minBlock = action.payload;
    },
    setMaxBlock: (state, action: PayloadAction<number | undefined>) => {
      state.maxBlock = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.lastTimestamp = action.payload.lastTimestamp;
        state.contentTypes = action.payload.contentTypes;
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setContentCategory,
  setAdvancedOptionsOpen,
  setAmount,
  setFilterDate,
  setFilterTime,
  setOwnerFilter,
  setContentType,
  setMinBlock,
  setMaxBlock,
} = arweaveSearchSlice.actions;

export default arweaveSearchSlice.reducer;