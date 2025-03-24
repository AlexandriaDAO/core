import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUserArweaveAssets } from "./thunks/fetchUserArweaveAssets";
import { AssetItem, AssetsState } from "./types";

const initialState: AssetsState = {
	assets: [],
	loading: false,
	error: null,
	selectedAsset: null,
};

const assetsSlice = createSlice({
	name: "assets",
	initialState,
	reducers: {
		selectAsset: (state, action: PayloadAction<AssetItem | null>) => {
			state.selectedAsset = action.payload;
		},
		clearAssets: (state) => {
			state.assets = [];
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUserArweaveAssets.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUserArweaveAssets.fulfilled, (state, action) => {
				state.loading = false;
				state.assets = action.payload;
			})
			.addCase(fetchUserArweaveAssets.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || "Failed to fetch assets";
			});
	},
});

export const { selectAsset, clearAssets } = assetsSlice.actions;
export default assetsSlice.reducer;
