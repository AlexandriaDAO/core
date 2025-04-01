import { createAsyncThunk } from "@reduxjs/toolkit";
import { ArweaveAssetItem } from "../types";
import { AssetManager } from "@dfinity/assets";

// Thunk for checking availability of a single asset
export const checkAssetAvailability = createAsyncThunk<
	ArweaveAssetItem,
	{
		asset: ArweaveAssetItem,
		assetManager: AssetManager,
	},
	{ rejectValue: string }
>("assets/checkAssetAvailability", async ({asset, assetManager}, { rejectWithValue }) => {
	try {
		const assetKey = `/arweave/${asset.id}`;
		const canisterAsset = await assetManager.get(assetKey);

		return {
			...asset,
			pulled: canisterAsset !== undefined
		};
	} catch (error) {
		console.error("Error checking asset availability:", error);
		return {
			...asset,
			pulled: false
		};
	}
}); 