import { createAsyncThunk } from "@reduxjs/toolkit";
import { ArweaveAssetItem } from "../types";
import { AssetManager } from "@dfinity/assets";

export const deleteAssetFromCanister = createAsyncThunk<
	boolean,
	{
        asset: ArweaveAssetItem,
        assetManager: AssetManager,
    },
	{ rejectValue: string }
>("assets/deleteFromCanister", async ({asset, assetManager}, { rejectWithValue }) => {
	try {
        const assetKey = `/arweave/${asset.id}`;
        const batch = assetManager.batch();
        batch.delete(assetKey);
        await batch.commit();
		return true;
	} catch (error) {
		console.error("Error deleting asset from canister:", error);
		return rejectWithValue(error instanceof Error ? error.message : "Unknown error occurred");
	}
});
