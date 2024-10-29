import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchState } from '../../../shared/types/queries';
import { fileTypeCategories } from '../../../shared/types/files';

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
  isLoading: boolean;
  searchState: SearchState;
  selectedContent: { id: string; type: string } | null;
  mintableState: Record<string, MintableStateItem>;
  nsfwModelLoaded: boolean;
}

const initialState: ArweaveState = {
  isLoading: false,
  searchState: {
    searchTerm: '',
    filterDate: '',
    contentCategory: 'favorites',
    tags: fileTypeCategories.favorites,
    amount: 12,
    filterTime: '',
    ownerFilter: '',
  },
  selectedContent: null,
  mintableState: {},
  nsfwModelLoaded: false,
};

// Action to set prediction results
export const setPredictionResults = createAction<{ id: string; predictions: PredictionResults }>(
  'arweave/setPredictionResults'
);

const arweaveSlice = createSlice({
  name: 'arweave',
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSearchState: (state, action: PayloadAction<Partial<SearchState>>) => {
      state.searchState = { ...state.searchState, ...action.payload };
      
      // Update tags based on the content category
      if (action.payload.contentCategory !== undefined) {
        state.searchState.tags = fileTypeCategories[action.payload.contentCategory] || [];
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
    resetMintableState(state) {
      state.mintableState = {};
    },
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
  setIsLoading,
  setSearchState,
  setSelectedContent,
  setFilterDate,
  setFilterTime,
  setMintableState,
  setMintableStates,
  setNsfwModelLoaded,
  resetMintableState,
} = arweaveSlice.actions;

export default arweaveSlice.reducer;
