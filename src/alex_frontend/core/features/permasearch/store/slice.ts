import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchState, Filters } from '../types/index';

const initialFilters: Filters = {
  types: ["image/jpeg"],
  categories: ["images"],
  include: undefined,
  customType: "",
  tags: [],
  query: "",
  timestamp: undefined, // No timestamp filtering by default
};

const initialState: SearchState = {
  filters: { ...initialFilters },
  appliedFilters: { ...initialFilters },
  showFilters: false,
  expanded: {},
  sortOrder: "HEIGHT_DESC",
  safeSearch: true,
  continuousScroll: true,
};

const permasearchSlice = createSlice({
  name: "permasearch",
  initialState,
  reducers: {
    // Filter actions
    setQuery: (state, action: PayloadAction<string>) => {
      state.filters.query = action.payload;
    },
    clearQuery: (state) => {
      state.filters.query = "";
    },
    setTimestamp: (state, action: PayloadAction<number|undefined>) => {
      state.filters.timestamp = action.payload;
    },
    setFilterTypes: (state, action: PayloadAction<string[]>) => {
      state.filters.types = action.payload;
    },
    setFilterCategories: (state, action: PayloadAction<string[]>) => {
      state.filters.categories = action.payload;
    },
    setFilterInclude: (state, action: PayloadAction<number | undefined>) => {
      state.filters.include = action.payload;
    },
    setFilterCustomType: (state, action: PayloadAction<string>) => {
      state.filters.customType = action.payload;
    },
    setFilterTags: (state, action: PayloadAction<Array<{ name: string; value: string }>>) => {
      state.filters.tags = action.payload;
    },
    addFilterTag: (state, action: PayloadAction<{ name: string; value: string }>) => {
      const exists = state.filters.tags.some((tag: { name: string; value: string }) =>
        tag.name === action.payload.name && tag.value === action.payload.value
      );
      if (!exists) {
        state.filters.tags.push(action.payload);
      }
    },
    removeFilterTag: (state, action: PayloadAction<{ name: string; value: string }>) => {
      state.filters.tags = state.filters.tags.filter((tag: { name: string; value: string }) =>
        !(tag.name === action.payload.name && tag.value === action.payload.value)
      );
    },

    // Apply/Reset filters
    applyFilters: (state) => {
      state.appliedFilters = { ...state.filters };
    },
    resetFilters: (state) => {
      state.filters = { ...initialFilters };
      state.appliedFilters = { ...initialFilters };
    },
    setFilters: (state, action: PayloadAction<Filters>) => {
      state.filters = action.payload;
    },

    // UI state actions
    setSortOrder: (state, action: PayloadAction<string>) => {
      state.sortOrder = action.payload;
    },
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === "HEIGHT_DESC" ? "HEIGHT_ASC" : "HEIGHT_DESC";
    },
    setShowFilters: (state, action: PayloadAction<boolean>) => {
      state.showFilters = action.payload;
    },
    toggleShowFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    setSafeSearch: (state, action: PayloadAction<boolean>) => {
      state.safeSearch = action.payload;
    },
    setContinuousScroll: (state, action: PayloadAction<boolean>) => {
      state.continuousScroll = action.payload;
    },
    toggleExpanded: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      state.expanded[key] = !state.expanded[key];
    },

    // Reset all state
    reset: () => initialState,
  },
});

export const {
  setQuery,
  clearQuery,
  setTimestamp,
  setFilterTypes,
  setFilterCategories,
  setFilterInclude,
  setFilterCustomType,
  setFilterTags,
  addFilterTag,
  removeFilterTag,
  applyFilters,
  resetFilters,
  setFilters,
  setSortOrder,
  toggleSortOrder,
  setShowFilters,
  toggleShowFilters,
  setSafeSearch,
  setContinuousScroll,
  toggleExpanded,
  reset,
} = permasearchSlice.actions;

export default permasearchSlice.reducer;