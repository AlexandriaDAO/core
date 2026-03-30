import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUserArweaveAssets } from "./thunks/fetchUserArweaveAssets";
import { ArweaveAssetItem, ArweaveAssetsState } from "./types";

const initialState: ArweaveAssetsState = {
	assets: [],

	selected: null,

	loading: false,
	error: null,
};

const assetsSlice = createSlice({
	name: "arweaveAssets",
	initialState,
	reducers: {
		setAssets: (state, action: PayloadAction<ArweaveAssetItem[]>) => {
			state.assets = action.payload;
		},
		selectAsset: (state, action: PayloadAction<ArweaveAssetItem | null>) => {
			state.selected = action.payload;
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

export const { selectAsset, clearAssets, setAssets } = assetsSlice.actions;
export default assetsSlice.reducer;
