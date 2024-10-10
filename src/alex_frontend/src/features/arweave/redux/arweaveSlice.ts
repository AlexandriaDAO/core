import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, SearchState } from '../types/queries';

export interface MintableStateItem {
  mintable: boolean;
  predictions?: Record<string, number>;
}

interface ArweaveState {
  transactions: Transaction[];
  isLoading: boolean;
  searchState: SearchState;
  selectedContent: { id: string; type: string } | null;
  mintableState: Record<string, MintableStateItem>;
  nsfwModelLoaded: boolean;
}

const initialState: ArweaveState = {
  transactions: [],
  isLoading: false,
  searchState: {
    searchTerm: '',
    selectedTags: [],
    filterDate: '',
    contentCategory: '',
    tags: [],
    amount: 0,
    filterTime: '',
    ownerFilter: '',
    advancedOptionsOpen: false,
  },
  selectedContent: null,
  mintableState: {},
  nsfwModelLoaded: false,
};

// Action to set prediction results
export const setPredictionResults = createAction<{ id: string; predictions: Record<string, number> }>(
  'arweave/setPredictionResults'
);

const arweaveSlice = createSlice({
  name: 'arweave',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
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
    setMintableState: (state, action: PayloadAction<{ id: string; mintable: boolean; predictions?: Record<string, number> }>) => {
      const { id, mintable, predictions } = action.payload;
      state.mintableState[id] = { mintable, predictions };
    },
    setMintableStates: (state, action: PayloadAction<Record<string, MintableStateItem>>) => {
      state.mintableState = { ...state.mintableState, ...action.payload };
    },
    setNsfwModelLoaded: (state, action: PayloadAction<boolean>) => {
      state.nsfwModelLoaded = action.payload;
    },
    resetTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.mintableState = {};
    },
  },
  extraReducers: (builder) => {
    // Add case for setPredictionResults
    builder.addCase(setPredictionResults, (state, action) => {
      const { id, predictions } = action.payload;
      state.mintableState[id] = { mintable: false, predictions };
    });
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
  resetTransactions,
} = arweaveSlice.actions;

export default arweaveSlice.reducer;