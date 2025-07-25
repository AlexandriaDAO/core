import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchState, Filters, DateRange } from '../types/index';

const initialFilters: Filters = {
  types: ["image/jpeg"],
  categories: ["images"],
  dateRange: (() => {
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - 7);
    return {
      from: from.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    };
  })(),
  datePreset: "last7days",
  customType: "",
  tags: [],
};

const initialState: SearchState = {
  query: "",
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
    // Query actions
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    clearQuery: (state) => {
      state.query = "";
    },

    // Filter actions
    setFilterTypes: (state, action: PayloadAction<string[]>) => {
      state.filters.types = action.payload;
    },
    setFilterCategories: (state, action: PayloadAction<string[]>) => {
      state.filters.categories = action.payload;
    },
    setFilterDateRange: (state, action: PayloadAction<DateRange>) => {
      state.filters.dateRange = action.payload;
    },
    setFilterDatePreset: (state, action: PayloadAction<string>) => {
      state.filters.datePreset = action.payload;
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
  setFilterTypes,
  setFilterCategories,
  setFilterDateRange,
  setFilterDatePreset,
  setFilterCustomType,
  setFilterTags,
  addFilterTag,
  removeFilterTag,
  applyFilters,
  resetFilters,
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