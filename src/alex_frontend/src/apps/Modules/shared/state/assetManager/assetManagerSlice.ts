import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';


interface assetManagerState {
  isLoading: boolean;
}

const initialState: assetManagerState = {
  isLoading: false,
};

const assetManagerSlice = createSlice({
  name: 'assetManager',
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
  },
});



export const {
  setIsLoading,
} = assetManagerSlice.actions;

export default assetManagerSlice.reducer;
