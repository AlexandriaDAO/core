import { createAsyncThunk } from "@reduxjs/toolkit";
import { AssetManager } from "@dfinity/assets";
import { fetchFile } from "../utils/assetUtils";
import { uploadToCanister } from "../utils/assetUtils";
import { AppDispatch, RootState } from "@/store";
import { setPulling } from "../arweaveAssetsSlice";
import { addAsset } from "@/features/icp-assets/icpAssetsSlice";

export const pullAllAssets = createAsyncThunk<
	void,
	{
		assetManager: AssetManager,
	},
	{ state: RootState, rejectValue: string, dispatch: AppDispatch }
>("assets/pullAllAssets", async ({ assetManager }, { getState, rejectWithValue, dispatch }) => {
	try {
		const assets = getState().arweaveAssets.assets;
		const icpAssets = getState().icpAssets.assets;

		const assetsToPull = assets.filter(asset => !icpAssets.some(icpAsset => icpAsset.key === `/arweave/${asset.id}`));

		for (const asset of assetsToPull) {
			dispatch(setPulling(asset.id));
			try{
				// Fetch the file using our utility function
				const file = await fetchFile(asset);

				// Upload the file using our utility function
				await uploadToCanister(assetManager, "/arweave", file, asset.id);
				dispatch(addAsset({
					key: `/arweave/${asset.id}`,
					encodings: [],
					content_type: file.type
				}))
			} catch (error) {
				console.error(`Error details for asset ${asset.id}:`, error);
				if (error instanceof Error && error.message.includes("is out of cycles")) {
					throw new Error(`Aborting!! Canister is out of cycles. Please top up the canister.`);
				}

				if (error instanceof Error && error.message.includes("already exists")) {
					throw new Error(`Aborting!! Asset ${asset.id} already exists in the canister.`);
				}

				throw new Error(`Aborting!! Failed to pull asset ${asset.id}`);
			}finally{
				dispatch(setPulling(null));
			}
		}
	} catch (error) {
		console.error("Failed to pull assets:", error);
		return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
	}
});