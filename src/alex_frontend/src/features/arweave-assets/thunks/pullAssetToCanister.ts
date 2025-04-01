import { createAsyncThunk } from "@reduxjs/toolkit";
import { ArweaveAssetItem } from "../types";
import { AssetManager } from "@dfinity/assets";
import { fetchFile } from "../utils/assetUtils";
import { uploadToCanister } from "../utils/assetUtils";

export const pullAssetToCanister = createAsyncThunk<
	ArweaveAssetItem,
	{
        asset: ArweaveAssetItem,
		assetManager: AssetManager,
	},
	{ rejectValue: string }
>("assets/pullToCanister", async ({ asset, assetManager }, { rejectWithValue }) => {
	try {
		// Fetch the file using our utility function
		const file = await fetchFile(asset);

		// Upload the file using our utility function
		await uploadToCanister(assetManager, "/arweave", file, asset.id);

		// Return updated asset with pulled status
		return {
			...asset,
			pulled: true
		};
	} catch (error) {
		console.error("Failed to pull asset to canister:", error);
		return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
	}
}); 