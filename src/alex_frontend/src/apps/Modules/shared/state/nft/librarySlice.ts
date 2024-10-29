import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LibraryState {
  selectedArweaveIds: string[];
  selectedPrincipals: string[];
}

const initialState: LibraryState = {
  selectedArweaveIds: [],
  selectedPrincipals: [],
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setSelectedArweaveIds: (state, action: PayloadAction<string[]>) => {
      state.selectedArweaveIds = action.payload;
    },
    setSelectedPrincipals: (state, action: PayloadAction<string[]>) => {
      state.selectedPrincipals = action.payload;
    },
    addSelectedPrincipal: (state, action: PayloadAction<string>) => {
      if (!state.selectedPrincipals.includes(action.payload)) {
        state.selectedPrincipals.push(action.payload);
      }
    },
    removeSelectedPrincipal: (state, action: PayloadAction<string>) => {
      state.selectedPrincipals = state.selectedPrincipals.filter(
        (p) => p !== action.payload
      );
    },
  },
});

export const {
  setSelectedArweaveIds,
  setSelectedPrincipals,
  addSelectedPrincipal,
  removeSelectedPrincipal,
} = librarySlice.actions;
export default librarySlice.reducer;
