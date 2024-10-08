import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ArweaveState {
  contentCategory: string;
  isLoading: boolean;
  searchResults: any[]; // Replace 'any' with a more specific type if you have one
  advancedOptionsOpen: boolean;
  amount: number;
  filterDate: string;
  filterTime: string;
  ownerFilter: string;
  contentType: string;
}

const initialState: ArweaveState = {
  contentCategory: 'image',
  isLoading: false,
  searchResults: [],
  advancedOptionsOpen: false,
  amount: 10,
  filterDate: '',
  filterTime: '',
  ownerFilter: '',
  contentType: '',
};

const arweaveSlice = createSlice({
  name: 'arweave',
  initialState,
  reducers: {
    setContentCategory: (state, action: PayloadAction<string>) => {
      state.contentCategory = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.searchResults = action.payload;
    },
    setAdvancedOptionsOpen: (state, action: PayloadAction<boolean>) => {
      state.advancedOptionsOpen = action.payload;
    },
    setAmount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
    },
    setFilterDate: (state, action: PayloadAction<string>) => {
      state.filterDate = action.payload;
    },
    setFilterTime: (state, action: PayloadAction<string>) => {
      state.filterTime = action.payload;
    },
    setOwnerFilter: (state, action: PayloadAction<string>) => {
      state.ownerFilter = action.payload;
    },
    setContentType: (state, action: PayloadAction<string>) => {
      state.contentType = action.payload;
    },
  },
});

export const {
  setContentCategory,
  setIsLoading,
  setSearchResults,
  setAdvancedOptionsOpen,
  setAmount,
  setFilterDate,
  setFilterTime,
  setOwnerFilter,
  setContentType,
} = arweaveSlice.actions;

export default arweaveSlice.reducer;