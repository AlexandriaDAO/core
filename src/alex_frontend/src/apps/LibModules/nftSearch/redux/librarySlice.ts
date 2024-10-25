import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LibraryState {
  selectedArweaveIds: string[];
}

const initialState: LibraryState = {
  selectedArweaveIds: [],
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setSelectedArweaveIds: (state, action: PayloadAction<string[]>) => {
      state.selectedArweaveIds = action.payload;
    },
  },
});

export const { setSelectedArweaveIds } = librarySlice.actions;
export default librarySlice.reducer;
