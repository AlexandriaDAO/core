import {
  ActionReducerMapBuilder,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { createAssetCanister, getAssetCanister } from "./assetManagerThunks";
import { toast } from "sonner";

interface AssetManagerState {
  isLoading: boolean;
  error: string | null;
  userAssetCanister:string;
}

const initialState: AssetManagerState = {
  isLoading: false,
  error:"",
  userAssetCanister:""
};

const assetManagerSlice = createSlice({
  name: "assetManager",
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AssetManagerState>) => {
    builder.addCase(createAssetCanister.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(createAssetCanister.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userAssetCanister=action.payload;
      state.error = null;
      toast.success("New asset canister created!");
    })
    .addCase(createAssetCanister.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      toast.error(action.payload as string);
    }).addCase(getAssetCanister.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(getAssetCanister.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userAssetCanister=action.payload;
      state.error = null;
    })
    .addCase(getAssetCanister.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      toast.error(action.payload as string);
    })
  },
});

export const { setIsLoading } = assetManagerSlice.actions;

export default assetManagerSlice.reducer;
