import { createAsyncThunk } from "@reduxjs/toolkit";
import { ArweaveAssetItem } from "../types";
import { AssetManager } from "@dfinity/assets";

export const checkAssetsAvailability = createAsyncThunk<
	ArweaveAssetItem[],
	{
        assets: ArweaveAssetItem[],
        assetManager: AssetManager,
    },
	{ rejectValue: string }
>("assets/checkAssetsAvailability", async ({assets, assetManager}, { rejectWithValue }) => {
	try {
        const canisterAssets = await assetManager.list();

        const assetKeysInCanister = new Set(canisterAssets.map((asset) => asset.key));

		// Update assets with their pulled status
		const updatedAssets = assets.map(asset => ({
			...asset,
			pulled: assetKeysInCanister.has(`/arweave/${asset.id}`)
		}));

		return updatedAssets;
	} catch (error) {
		console.error("Error checking assets availability:", error);
		return rejectWithValue(error instanceof Error ? error.message : "Unknown error occurred");
	}
});
