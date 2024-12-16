import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAssets, getAssets } from '@/services/assetService';
import { RootState } from "@/store";
import { AssetType } from "@/features/upload/uploadSlice";
import { Video } from "../types";
// Define the async thunk
const fetchMyVideos = createAsyncThunk<
    {
        videos: Video[],
        cursor: string,
    }, // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("asset/fetchMyVideos", async (_, { rejectWithValue, getState }) => {
    try {
        const {asset: {cursor, videos }, auth: {user}} = getState();

        if(!user || !user.principal) return { videos, cursor }

        const txs = await fetchAssets({after: cursor, owner: user.principal, type: AssetType.Video});

        const newVideos = await getAssets<Video>(txs);

        const newCursor = txs[txs.length-1]?.cursor ?? '';

        return {
            videos: [...videos, ...newVideos],
            cursor: newCursor
        }
    } catch (error) {
        console.error("Failed to Fetch My Videos:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Videos"
    );
});


export default fetchMyVideos;