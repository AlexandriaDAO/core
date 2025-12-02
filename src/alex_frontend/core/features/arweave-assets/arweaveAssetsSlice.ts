import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUserArweaveAssets } from "./thunks/fetchUserArweaveAssets";
import { deleteAssetFromCanister } from "./thunks/deleteAssetFromCanister";
import { checkAssetsAvailability } from "./thunks/checkAssetsAvailability";
import { checkAssetAvailability } from "./thunks/checkAssetAvailability";
import { pullAssetToCanister } from "./thunks/pullAssetToCanister";
import { ArweaveAssetItem, ArweaveAssetsState } from "./types";
import { pullAllAssets } from "./thunks/pullAllAssets";

const initialState: ArweaveAssetsState = {
	assets: [],

	selected: null,

	pulling: null,
	pullError: null,

	deleting: null,
	deleteError: null,

	loading: false,
	error: null,
};

const assetsSlice = createSlice({
	name: "arweaveAssets",
	initialState,
	reducers: {
		setPulling: (state, action: PayloadAction<string | null>) => {
			state.pulling = action.payload;
		},
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
			})
			
			.addCase(deleteAssetFromCanister.pending, (state, action) => {
				state.deleting = action.meta.arg.asset.id;
				state.deleteError = null;
			})
			.addCase(deleteAssetFromCanister.fulfilled, (state, action) => {
				state.deleting = null;
				state.deleteError = null;
			})
			.addCase(deleteAssetFromCanister.rejected, (state, action) => {
				state.deleting = null;
				state.deleteError = action.payload as string;
			})
			
			// .addCase(checkAssetsAvailability.pending, (state) => {
			// 	state.loading = true;
			// 	state.error = null;
			// })
			// .addCase(checkAssetsAvailability.fulfilled, (state, action) => {
			// 	state.loading = false;
			// 	state.assets = action.payload;
			// })
			// .addCase(checkAssetsAvailability.rejected, (state, action) => {
			// 	state.loading = false;
			// 	state.error = action.payload || "Failed to check assets availability";
			// })
			
			// .addCase(checkAssetAvailability.pending, (state, action) => {
			// 	state.loading = true;
			// 	state.error = null;
			// })
			// .addCase(checkAssetAvailability.fulfilled, (state, action) => {
			// 	state.loading = false;
			// 	state.error = null;
			// 	state.assets = state.assets.map(asset => 
			// 		asset.id === action.payload.id ? action.payload : asset
			// 	);
			// })
			// .addCase(checkAssetAvailability.rejected, (state, action) => {
			// 	state.loading = false;
			// 	state.error = action.payload as string;
			// })
			
			.addCase(pullAssetToCanister.pending, (state, action) => {
				state.pulling = action.meta.arg.asset.id;
				state.pullError = null;
			})
			.addCase(pullAssetToCanister.fulfilled, (state, action) => {
				state.pulling = null;
				state.pullError = null;
			})
			.addCase(pullAssetToCanister.rejected, (state, action) => {
				state.pulling = null;
				state.pullError = action.payload as string;
			})

			.addCase(pullAllAssets.pending, (state, action) => {
				state.pulling = null;
				state.pullError = null;
			})
			.addCase(pullAllAssets.fulfilled, (state, action) => {
				state.pulling = null;
				state.pullError = null;
			})
			.addCase(pullAllAssets.rejected, (state, action) => {
				state.pulling = null;
				state.pullError = action.payload as string;
			});
	},
});

export const { selectAsset, clearAssets, setAssets, setPulling } = assetsSlice.actions;
export default assetsSlice.reducer;
