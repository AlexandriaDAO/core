import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from './types/queries';

// Update the SearchState interface to include the 'mode' property
interface SearchState {
  mode: 'random' | 'general';
  contentCategory: string;
  contentType: string;
  amount: number;
  filterDate: string;
  filterTime: string;
  ownerFilter: string;
  advancedOptionsOpen: boolean;
}

interface ArweaveState {
  transactions: Transaction[];
  isLoading: boolean;
  contentType: string;
  amount: number;
  filterDate: string;
  filterTime: string;
  ownerFilter: string;
  minBlock: number | undefined;
  maxBlock: number | undefined;
  contentCategory: string;
  advancedOptionsOpen: boolean;
  searchState: SearchState;
}

const initialState: ArweaveState = {
  transactions: [],
  isLoading: false,
  contentType: "",
  amount: 12,
  filterDate: "",
  filterTime: "00:00",
  ownerFilter: "",
  minBlock: undefined,
  maxBlock: undefined,
  contentCategory: "images",
  advancedOptionsOpen: false,
  searchState: {
    mode: 'random', // Add the 'mode' property with a default value
    contentCategory: 'all',
    contentType: '',
    amount: 10,
    filterDate: '',
    filterTime: '',
    ownerFilter: '',
    advancedOptionsOpen: false,
  },
};

const arweaveSlice = createSlice({
  name: 'arweave',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setContentType: (state, action: PayloadAction<string>) => {
      state.contentType = action.payload;
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
    setMinBlock: (state, action: PayloadAction<number | undefined>) => {
      state.minBlock = action.payload;
    },
    setMaxBlock: (state, action: PayloadAction<number | undefined>) => {
      state.maxBlock = action.payload;
    },
    setContentCategory: (state, action: PayloadAction<string>) => {
      state.contentCategory = action.payload;
    },
    setAdvancedOptionsOpen: (state, action: PayloadAction<boolean>) => {
      state.advancedOptionsOpen = action.payload;
    },
    setSearchState: (state, action: PayloadAction<Partial<SearchState>>) => {
      state.searchState = { ...state.searchState, ...action.payload };
    },
  },
});

export const {
  setTransactions,
  setIsLoading,
  setContentType,
  setAmount,
  setFilterDate,
  setFilterTime,
  setOwnerFilter,
  setMinBlock,
  setMaxBlock,
  setContentCategory,
  setAdvancedOptionsOpen,
  setSearchState,
} = arweaveSlice.actions;

export default arweaveSlice.reducer;