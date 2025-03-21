import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchParams {
  start: number;
  end: number;
  pageSize: number;
  startFromEnd: boolean;
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
  totalItems: number;
  sortBalanceBy:string;
}

const initialState: LibraryState = {
  selectedPrincipals: ['new'],
  sortAsc: true,
  tags: [],
  collection: 'NFT',
  isLoading: false,
  noResults: false,
  searchParams: {
    start: 0,
    end: 20,
    pageSize: 20,
    startFromEnd: true
  },
  lastSearchTimestamp: 0,
  totalItems: 0,
  sortBalanceBy: 'DEFAULT'
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    togglePrincipal: (state, action: PayloadAction<string>) => {
      const principalId = action.payload;
      state.selectedPrincipals = state.selectedPrincipals[0] === principalId ? ['new'] : [principalId];
      if (state.selectedPrincipals.length > 0) {
        state.searchParams = {
          ...initialState.searchParams,
          pageSize: state.searchParams.pageSize
        };
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
    setBalanceSort: (state, action: PayloadAction<string>) => {
      state.sortBalanceBy = action.payload;
    },
    setNoResults: (state, action: PayloadAction<boolean>) => {
      state.noResults = action.payload;
    },
    setSearchParams: (state, action: PayloadAction<Partial<SearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    updateLastSearchTimestamp: (state, action: PayloadAction<number | undefined>) => {
      state.lastSearchTimestamp = action.payload !== undefined ? action.payload : Date.now();
    },
    resetSearch: (state) => {
      return {
        ...initialState,
        collection: state.collection,
        selectedPrincipals: state.selectedPrincipals,
        searchParams: {
          ...state.searchParams
        },
        totalItems: state.totalItems,
        sortBalanceBy: state.sortBalanceBy
      };
    },
    setTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
      if (state.selectedPrincipals[0] === 'new' && state.searchParams.start === 0 && action.payload > 0) {
        const newStart = Math.max(0, action.payload - state.searchParams.pageSize);
        state.searchParams.start = newStart;
        state.searchParams.end = Math.min(newStart + state.searchParams.pageSize, action.payload);
      }
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
  resetSearch,
  setTotalItems,
  setBalanceSort
} = librarySlice.actions;

export default librarySlice.reducer;
