import {
  ActionReducerMapBuilder,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  createAssetCanister,
  fetchUserNfts,
  getCallerAssetCanister,
  getAssetList,
  syncNfts,
  getCanisterCycles,
} from "./assetManagerThunks";
import { toast } from "sonner";

interface AssetManagerState {
  isLoading: boolean;
  error: string | null;
  userAssetCanister: string | null;
  assetList: Array<{ key: string; content_type: string }>;
  urls: string[];
  cycles:string;
}

const initialState: AssetManagerState = {
  isLoading: false,
  error: "",
  urls: [""],
  assetList: [{ key: "", content_type: "" }],
  userAssetCanister: null,
  cycles:""
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
    builder
      .addCase(createAssetCanister.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAssetCanister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userAssetCanister = action.payload;
        state.error = null;
        toast.success("New asset canister created!");
      })
      .addCase(createAssetCanister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      .addCase(getCallerAssetCanister.pending, (state) => {
        state.error = null;
      })
      .addCase(getCallerAssetCanister.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.userAssetCanister = action.payload;
        state.error = null;
      })
      .addCase(getCallerAssetCanister.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload as string;
        //  toast.error(action.payload as string);
      })
      .addCase(fetchUserNfts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserNfts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.urls = action.payload;
        state.error = null;
      })
      .addCase(fetchUserNfts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // toast.error(action.payload as string);
      })
      .addCase(getAssetList.pending, (state) => {
        state.error = null;
      })
      .addCase(getAssetList.fulfilled, (state, action) => {
        state.assetList = action.payload;
        state.error = null;
      })
      .addCase(getAssetList.rejected, (state, action) => {
        state.error = action.payload as string;
        // toast.error(action.payload as string);
      })
      .addCase(syncNfts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncNfts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(syncNfts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // toast.error(action.payload as string);
      })
      .addCase(getCanisterCycles.pending, (state) => {
        state.error = null;
      })
      .addCase(getCanisterCycles.fulfilled, (state, action) => {
        state.cycles=action.payload;
        state.error = null;
      })
      .addCase(getCanisterCycles.rejected, (state, action) => {
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const { setIsLoading } = assetManagerSlice.actions;

export default assetManagerSlice.reducer;
