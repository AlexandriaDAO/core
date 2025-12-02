import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IcpAssetItem, IcpAssetsState } from "./types";
import remove from "./thunks/remove";
import fetch from "./thunks/fetch";
import upload from "./thunks/upload";
import { deleteAssetFromCanister } from "../arweave-assets/thunks/deleteAssetFromCanister";
import { pullAssetToCanister } from "../arweave-assets/thunks/pullAssetToCanister";

const initialState: IcpAssetsState = {
	assets: [],

	uploading: false,
	percentage: 0,
	uploadError: null,

	deleting: null,
	deleteError: null,

	loading: false,
	error: null,
};

const icpAssetsSlice = createSlice({
	name: "icpAssets",
	initialState,
	reducers: {
		setProgress: (state, action: PayloadAction<number>) => {
			state.percentage = action.payload;
		},
		addAsset: (state, action: PayloadAction<IcpAssetItem>) => {
			state.assets = [...state.assets, action.payload];
		},
		setAssets: (state, action: PayloadAction<IcpAssetItem[]>) => {
			state.assets = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetch.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetch.fulfilled, (state, action) => {
				state.loading = false;
				state.assets = action.payload;
			})
			.addCase(fetch.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || "Failed to fetch assets";
			})
			
			.addCase(remove.pending, (state, action) => {
				state.deleting = action.meta.arg.asset;
				state.deleteError = null;
			})
			.addCase(remove.fulfilled, (state, action) => {
				state.deleting = null;
				state.deleteError = null;
				state.assets = state.assets.filter(asset => asset.key !== action.meta.arg.asset.key);
			})
			.addCase(remove.rejected, (state, action) => {
				state.deleting = null;
				state.deleteError = action.payload as string;
			})
			
			.addCase(upload.pending, (state, action) => {
				state.percentage = 0;
				state.uploading = true;
				state.uploadError = null;
			})
			.addCase(upload.fulfilled, (state, action) => {
				state.uploading = false;
				state.uploadError = null;
				state.assets = [...state.assets, action.payload];
			})
			.addCase(upload.rejected, (state, action) => {
				state.uploading = false;
				state.uploadError = action.payload as string;
			})

			.addCase(deleteAssetFromCanister.fulfilled, (state, action) => {
				state.deleting = null;
				state.deleteError = null;
				state.assets = state.assets.filter(asset => 
					asset.key !== `/arweave/${action.meta.arg.asset.id}`
				);
			})

			.addCase(pullAssetToCanister.fulfilled, (state, action) => {
				state.assets = [...state.assets, {
					key: `/arweave/${action.meta.arg.asset.id}`,
					content_type: action.meta.arg.asset.contentType,
					encodings: [],
				} as IcpAssetItem];
			})
		},
});

export const { setAssets, setProgress, addAsset } = icpAssetsSlice.actions;
export default icpAssetsSlice.reducer;
