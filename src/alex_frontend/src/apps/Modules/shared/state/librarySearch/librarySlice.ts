import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchParams {
  start: number;
  end: number;
  pageSize: number;
}

interface LibraryState {
  selectedPrincipals: string[];
  sortAsc: boolean;
  tags: string[];
  collection: 'NFT' | 'SBT';
  isLoading: boolean;
  noResults: boolean;
  searchParams: SearchParams;
  lastSearchTimestamp: number;
}

const initialState: LibraryState = {
  selectedPrincipals: [],
  sortAsc: true,
  tags: [],
  collection: 'NFT',
  isLoading: false,
  noResults: false,
  searchParams: {
    start: 0,
    end: 20,
    pageSize: 20
  },
  lastSearchTimestamp: 0
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    togglePrincipal: (state, action: PayloadAction<string>) => {
      const principalId = action.payload;
      
      if (state.selectedPrincipals[0] === principalId) {
        state.selectedPrincipals = [];
      } else {
        state.selectedPrincipals = [principalId];
      }
    },
    toggleSortDirection: (state) => {
      state.sortAsc = !state.sortAsc;
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload;
    },
    toggleTag: (state, action: PayloadAction<string>) => {
      const tag = action.payload;
      const index = state.tags.indexOf(tag);
      if (index === -1) {
        state.tags.push(tag);
      } else {
        state.tags.splice(index, 1);
      }
    },
    setCollection: (state, action: PayloadAction<'NFT' | 'SBT'>) => {
      state.collection = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setNoResults: (state, action: PayloadAction<boolean>) => {
      state.noResults = action.payload;
    },
    setSearchParams: (state, action: PayloadAction<Partial<SearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    updateLastSearchTimestamp: (state) => {
      state.lastSearchTimestamp = Date.now();
    },
    resetSearch: (state) => {
      state.searchParams = initialState.searchParams;
      state.lastSearchTimestamp = 0;
    }
  },
});

export const {
  togglePrincipal,
  toggleSortDirection,
  setTags,
  toggleTag,
  setCollection,
  setLoading,
  setNoResults,
  setSearchParams,
  updateLastSearchTimestamp,
  resetSearch
} = librarySlice.actions;

export default librarySlice.reducer;
