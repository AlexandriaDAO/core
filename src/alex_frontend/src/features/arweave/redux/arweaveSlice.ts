import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../types/queries';

// Update the SearchState interface to include the 'mode' property
interface SearchState {
  mode: 'random' | 'general' | 'user';
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
  searchState: SearchState;
  selectedContent: { id: string; type: string } | null;
}

const initialState: ArweaveState = {
  transactions: [],
  isLoading: false,
  searchState: {
    mode: 'random',
    contentCategory: 'all',
    contentType: '',
    amount: 10,
    filterDate: '',
    filterTime: '',
    ownerFilter: '',
    advancedOptionsOpen: false,
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
  },
});

export const {
  setTransactions,
  setIsLoading,
  setSearchState,
  setSelectedContent,
} = arweaveSlice.actions;

export default arweaveSlice.reducer;