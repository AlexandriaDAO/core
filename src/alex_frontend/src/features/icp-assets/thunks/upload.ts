import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch } from "@/store";
import { setProgress } from "../icpAssetsSlice";
import { AssetManager } from "@dfinity/assets";
import { IcpAssetItem } from "../types";

const upload = createAsyncThunk<
	IcpAssetItem, // This is the return type of the thunk's payload
	{
		file: File;
		assetManager: AssetManager;
	}, //Argument that we pass to initialize
	{ rejectValue: string; dispatch: AppDispatch }
>(
	"icpAssets/upload",
	async (
		{ file, assetManager },
		{ rejectWithValue, dispatch }
	) => {
		try {

			// Use AssetManager's batch upload which handles chunking
			const batch = assetManager.batch();
			const key = await batch.store(file, { path: '/uploads' });

			// Commit the batch with progress tracking
			await batch.commit({
				onProgress: ({current, total}: {current: number, total: number}) => {
					const progressPercent = (current / total) * 100;
					dispatch(setProgress(progressPercent));
				}
			});

			return {
				key,
				content_type: file.type,
				encodings: []
			}
		} catch (error) {
			console.error("Failed to Upload File:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while uploading file"
		);
	}
);


export default upload;