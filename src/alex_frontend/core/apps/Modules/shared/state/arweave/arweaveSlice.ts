import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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

interface ArweaveState {
  isLoading: boolean;
  searchState: SearchState;
  predictions: Record<string, PredictionResults>;
  nsfwModelLoaded: boolean;
  lastCursor: string | null;
}

const initialState: ArweaveState = {
  isLoading: false,
  searchState: {
    searchTerm: '',
    timestamp: undefined,
    contentCategory: 'favorites',
    tags: fileTypeCategories.favorites,
    amount: 20,
    ownerFilter: '',
  },
  predictions: {},
  nsfwModelLoaded: false,
  lastCursor: null,
};

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
    setPredictionResults: (state, action: PayloadAction<{ id: string; predictions: PredictionResults }>) => {
      const { id, predictions } = action.payload;
      state.predictions[id] = predictions;
    },
    setNsfwModelLoaded: (state, action: PayloadAction<boolean>) => {
      state.nsfwModelLoaded = action.payload;
    },
    clearPredictions: (state) => {
      state.predictions = {};
    },
    setLastCursor: (state, action: PayloadAction<string | null>) => {
      state.lastCursor = action.payload;
    },
  },
});

export const {
  setIsLoading,
  setSearchState,
  setPredictionResults,
  setNsfwModelLoaded,
  clearPredictions,
  setLastCursor,
} = arweaveSlice.actions;

export default arweaveSlice.reducer;
