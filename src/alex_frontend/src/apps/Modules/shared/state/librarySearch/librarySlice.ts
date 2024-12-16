import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { performSearch } from './libraryThunks';

interface LibraryState {
  selectedPrincipals: string[];
  sortAsc: boolean;
  tags: string[];
  collection: 'icrc7' | 'icrc7_scion';
  isLoading: boolean;
}

const initialState: LibraryState = {
  selectedPrincipals: [],
  sortAsc: true,
  tags: [],
  collection: 'icrc7',
  isLoading: false,
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
    setCollection: (state, action: PayloadAction<'icrc7' | 'icrc7_scion'>) => {
      state.collection = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  togglePrincipal,
  toggleSortDirection,
  setTags,
  toggleTag,
  setCollection,
  setLoading
} = librarySlice.actions;
export default librarySlice.reducer;
