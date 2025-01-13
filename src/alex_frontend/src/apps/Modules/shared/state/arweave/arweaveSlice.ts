import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchState } from '../../../shared/types/queries';
import { fileTypeCategories } from '../../../shared/types/files';
import { setMintableStates } from '../content/contentDisplaySlice';
import { getAuthClient } from '@/features/auth/utils/authUtils';

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
    timestamp: undefined,
    contentCategory: 'favorites',
    tags: fileTypeCategories.favorites,
    amount: 20,
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
    resetSearch: (state) => {
      state.searchState = initialState.searchState;
      state.predictions = {};
    }
  },
});

// Create a thunk to handle prediction results and update mintable state
export const updatePredictionResults = createAsyncThunk(
  'arweave/updatePredictionResults',
  async ({ id, predictions }: { id: string; predictions: PredictionResults }, { dispatch }) => {
    dispatch(setPredictionResults({ id, predictions }));
    
    // Update mintable state based on predictions
    const client = await getAuthClient();
    const isAuthenticated = await client.isAuthenticated();
    const isMintable = !predictions.isPorn && isAuthenticated;
    dispatch(setMintableStates({ [id]: { mintable: isMintable } }));
  }
);

export const {
  setIsLoading,
  setSearchState,
  setPredictionResults,
  setNsfwModelLoaded,
  clearPredictions,
  resetSearch
} = arweaveSlice.actions;

export default arweaveSlice.reducer;
