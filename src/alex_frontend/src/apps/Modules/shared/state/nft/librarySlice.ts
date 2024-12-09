import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LibraryState {
  selectedPrincipals: string[];
  sortAsc: boolean;
  tags: string[];
  collection: 'icrc7' | 'icrc7_scion';
}

const initialState: LibraryState = {
  selectedPrincipals: [],
  sortAsc: true,
  tags: [],
  collection: 'icrc7',
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    togglePrincipal: (state, action: PayloadAction<string>) => {
      const principal = action.payload;
      const index = state.selectedPrincipals.indexOf(principal);
      if (index === -1) {
        state.selectedPrincipals.push(principal);
      } else {
        state.selectedPrincipals.splice(index, 1);
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
  },
});

export const {
  togglePrincipal,
  toggleSortDirection,
  setTags,
  toggleTag,
  setCollection
} = librarySlice.actions;
export default librarySlice.reducer;
