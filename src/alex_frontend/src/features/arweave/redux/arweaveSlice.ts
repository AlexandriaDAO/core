import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, SearchState } from '../types/queries';

interface ArweaveState {
  transactions: Transaction[];
  isLoading: boolean;
  searchState: SearchState;
  selectedContent: { id: string; type: string } | null;
  mintableState: Record<string, boolean>;
  nsfwModelLoaded: boolean;
}

const initialState: ArweaveState = {
  transactions: [],
  isLoading: false,
  searchState: {
    contentCategory: 'images',
    tags: [],
    amount: 12,
    filterDate: '',
    filterTime: '',
    ownerFilter: '',
    advancedOptionsOpen: false,
    maxTimestamp: undefined,
  },
  selectedContent: null,
  mintableState: {},
  nsfwModelLoaded: false,
};

const arweaveSlice = createSlice({
  name: 'arweave',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      // Clear mintableState when setting new transactions
      state.mintableState = {};
    },
    clearTransactionsAndMintableState: (state) => {
      state.transactions = [];
      state.mintableState = {};
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSearchState: (state, action: PayloadAction<Partial<SearchState>>) => {
      state.searchState = { ...state.searchState, ...action.payload };
    },
    setSelectedContent: (state, action: PayloadAction<{ id: string; type: string } | null>) => {
      state.selectedContent = action.payload;
    },
    setFilterDate: (state, action: PayloadAction<string>) => {
      state.searchState.filterDate = action.payload;
    },
    setFilterTime: (state, action: PayloadAction<string>) => {
      state.searchState.filterTime = action.payload;
    },
    setMintableState: (state, action: PayloadAction<{ id: string; mintable: boolean }>) => {
      state.mintableState[action.payload.id] = action.payload.mintable;
    },
    setMintableStates: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.mintableState = action.payload;
    },
    setNsfwModelLoaded: (state, action: PayloadAction<boolean>) => {
      state.nsfwModelLoaded = action.payload;
    },
  },
});

export const {
  setTransactions,
  clearTransactionsAndMintableState,
  setIsLoading,
  setSearchState,
  setSelectedContent,
  setFilterDate,
  setFilterTime,
  setMintableState,
  setMintableStates,
  setNsfwModelLoaded,
} = arweaveSlice.actions;

export default arweaveSlice.reducer;