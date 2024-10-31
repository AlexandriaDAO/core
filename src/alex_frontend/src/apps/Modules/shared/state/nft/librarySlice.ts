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
    addSelectedArweaveIds: (state, action: PayloadAction<string[]>) => {
      const newIds = action.payload.filter(
        id => !state.selectedArweaveIds.includes(id)
      );
      state.selectedArweaveIds.push(...newIds);
    },
    removeSelectedArweaveIds: (state, action: PayloadAction<string[]>) => {
      state.selectedArweaveIds = state.selectedArweaveIds.filter(
        id => !action.payload.includes(id)
      );
    },
    togglePrincipal: (state, action: PayloadAction<string>) => {
      const principal = action.payload;
      const index = state.selectedPrincipals.indexOf(principal);
      if (index === -1) {
        state.selectedPrincipals.push(principal);
      } else {
        state.selectedPrincipals.splice(index, 1);
      }
    }
  },
});

export const {
  setSelectedArweaveIds,
  setSelectedPrincipals,
  addSelectedPrincipal,
  removeSelectedPrincipal,
  addSelectedArweaveIds,
  removeSelectedArweaveIds,
  togglePrincipal
} = librarySlice.actions;
export default librarySlice.reducer;
