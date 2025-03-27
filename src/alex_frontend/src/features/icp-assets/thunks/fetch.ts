import { createAsyncThunk } from "@reduxjs/toolkit";
import { IcpAssetItem } from "../types";
import { AssetManager } from "@dfinity/assets";

const fetch = createAsyncThunk<
	IcpAssetItem[],
	{assetManager: AssetManager},
	{ rejectValue: string }
>("icpAssets/fetch", async ({assetManager}, { rejectWithValue }) => {
	try {
		// Fetch assets directly using the assetManager from the hook
		const assets = await assetManager.list();

		// get recently modified assets
		const filteredAssets = assets
			// Filter assets starting with '/uploads/' if needed (or remove if not needed)
			// .filter(asset => asset.key.startsWith('/uploads/'))
			.sort((a, b) => Number(b.encodings[0].modified) - Number(a.encodings[0].modified))
			.map(asset => ({
				...asset,
				encodings: asset.encodings.map(encoding => ({
					content_encoding: encoding.content_encoding,
					modified: Number(encoding.modified),
					length: Number(encoding.length)
				}))
			}));

		return filteredAssets;
	} catch (error) {
		console.error("Error fetching user assets:", error);
		return rejectWithValue(
			error instanceof Error ? error.message : "Unknown error occurred"
		);
	}
});

export default fetch;