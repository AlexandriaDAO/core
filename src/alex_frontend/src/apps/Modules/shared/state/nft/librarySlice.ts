import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LibraryState {
  selectedPrincipals: string[];
  sortAsc: boolean;
}

const initialState: LibraryState = {
  selectedPrincipals: [],
  sortAsc: false,
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
  },
});

export const {
  togglePrincipal,
  toggleSortDirection
} = librarySlice.actions;
export default librarySlice.reducer;
