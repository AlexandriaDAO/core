import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchState } from '../../../shared/types/queries';
import { fileTypeCategories } from '../../../shared/types/files';
import { setMintableState } from '../content/contentDisplaySlice';

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
  predictions: {},
  nsfwModelLoaded: false,
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
    setFilterDate: (state, action: PayloadAction<string>) => {
      state.searchState.filterDate = action.payload;
    },
    setFilterTime: (state, action: PayloadAction<string>) => {
      state.searchState.filterTime = action.payload;
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
  },
});

// Create a thunk to handle prediction results and update mintable state
export const updatePredictionResults = createAsyncThunk(
  'arweave/updatePredictionResults',
  async ({ id, predictions }: { id: string; predictions: PredictionResults }, { dispatch }) => {
    dispatch(setPredictionResults({ id, predictions }));
    
    // Update mintable state based on predictions
    const isMintable = !predictions.isPorn;
    dispatch(setMintableState({ id, mintable: isMintable }));
  }
);

export const {
  setIsLoading,
  setSearchState,
  setFilterDate,
  setFilterTime,
  setPredictionResults,
  setNsfwModelLoaded,
  clearPredictions,
} = arweaveSlice.actions;

export default arweaveSlice.reducer;
