import { createAsyncThunk } from "@reduxjs/toolkit";
import { AssetManager } from "@dfinity/assets";
import { IcpAssetItem } from "../types";

const remove = createAsyncThunk<
	void,
	{
        asset: IcpAssetItem,
        assetManager: AssetManager,
    },
	{ rejectValue: string }
>("icpAssets/remove", async ({asset, assetManager}, { rejectWithValue }) => {
	try {
		await assetManager.delete(asset.key);
	} catch (error) {
		console.error("Error deleting file from canister:", error);
		return rejectWithValue(error instanceof Error ? error.message : "Unknown error occurred");
	}
});

export default remove;