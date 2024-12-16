import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAssets, getAssets } from '@/services/assetService';
import { RootState } from "@/store";
import { AssetType } from "@/features/upload/uploadSlice";
import { Image } from "../types";
// Define the async thunk
const fetchMyImages = createAsyncThunk<
    {
        images: Image[],
        cursor: string,
    }, // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("asset/fetchMyImages", async (_, { rejectWithValue, getState }) => {
    try {
        const {asset: {cursor, images }, auth: {user}} = getState();

        // const txs = await fetchAssets({cursor, owner: user?.principal});

        // for testing instead of self, fetch all assets
        const txs = await fetchAssets({after: cursor, owner: '', type: AssetType.Image});

        const newImages = await getAssets<Image>(txs);

        const newCursor = txs[txs.length-1]?.cursor ?? '';

        return {
            images: [...images, ...newImages],
            cursor: newCursor
        }
    } catch (error) {
        console.error("Failed to Fetch My Images:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Images"
    );
});


export default fetchMyImages;