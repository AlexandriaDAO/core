import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, SearchState } from '../types/queries';
import { fileTypeCategories, supportedMimeTypes } from '../types/files';

export interface PredictionResults {
  Drawing: number;
  Hentai: number;
  Neutral: number;
  Porn: number;
  Sexy: number;
  isPorn: boolean;
}

export interface MintableStateItem {
  mintable: boolean;
  predictions?: PredictionResults;
}

interface ArweaveState {
  transactions: Transaction[];
  isLoading: boolean;
  searchState: SearchState;
  selectedContent: { id: string; type: string } | null;
  mintableState: Record<string, MintableStateItem>;
  nsfwModelLoaded: boolean;
  // searchFormOptions: {
  //   showNftOwners: boolean;
  //   showContentCategory: boolean;
  //   showAdvancedOptions: boolean;
  //   showNsfwModelControl: boolean;
  // };
}

const initialState: ArweaveState = {
  transactions: [],
  isLoading: false,
  searchState: {
    transactions: [],
    searchTerm: '',
    selectedTags: [],
    filterDate: '',
    contentCategory: 'favorites',
    tags: supportedMimeTypes,
    amount: 12,
    filterTime: '',
    ownerFilter: '',
    advancedOptionsOpen: false,
  },
  selectedContent: null,
  mintableState: {},
  nsfwModelLoaded: false,
  // searchFormOptions: {
  //   showNftOwners: false,
  //   showContentCategory: false,
  //   showAdvancedOptions: false,
  //   showNsfwModelControl: false,
  // },
};

// Action to set prediction results
export const setPredictionResults = createAction<{ id: string; predictions: PredictionResults }>(
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
      
      // If contentCategory is changed, update tags accordingly
      if (action.payload.contentCategory) {
        if (action.payload.contentCategory === 'all') {
          state.searchState.tags = supportedMimeTypes;
        } else {
          state.searchState.tags = fileTypeCategories[action.payload.contentCategory] || [];
        }
      }
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
    setMintableState: (state, action: PayloadAction<{ id: string; mintable: boolean; predictions?: PredictionResults }>) => {
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
    resetMintableState(state) {
      state.mintableState = {};
    },
    // setSearchFormOptions: (state, action: PayloadAction<Partial<ArweaveState['searchFormOptions']>>) => {
    //   state.searchFormOptions = { ...state.searchFormOptions, ...action.payload };
    // },
  },
  extraReducers: (builder) => {
    // Add case for setPredictionResults
    builder.addCase(setPredictionResults, (state, action) => {
      const { id, predictions } = action.payload;
      if (state.mintableState[id]) {
        state.mintableState[id].predictions = predictions;
      } else {
        state.mintableState[id] = { mintable: false, predictions };
      }
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
  resetMintableState,
  // setSearchFormOptions,
} = arweaveSlice.actions;

export default arweaveSlice.reducer;
