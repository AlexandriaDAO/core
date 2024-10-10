import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, SearchState } from '../types/queries';

interface ArweaveState {
  transactions: Transaction[];
  isLoading: boolean;
  searchState: SearchState;
  selectedContent: { id: string; type: string } | null;
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
  },
});

export const {
  setTransactions,
  setIsLoading,
  setSearchState,
  setSelectedContent,
  setFilterDate,
  setFilterTime,
} = arweaveSlice.actions;

export default arweaveSlice.reducer;