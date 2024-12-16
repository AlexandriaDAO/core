import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAssets, getAssets } from '@/services/assetService';
import { RootState } from "@/store";
import { AssetType } from "@/features/upload/uploadSlice";
import { Audio } from "../types";
// Define the async thunk
const fetchMyAudios = createAsyncThunk<
    {
        audios: Audio[],
        cursor: string,
    }, // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("asset/fetchMyAudios", async (_, { rejectWithValue, getState }) => {
    try {
        const {asset: {cursor, audios }, auth: {user}} = getState();

        if(!user || !user.principal) return { audios, cursor }

        const txs = await fetchAssets({after: cursor, owner: user.principal, type: AssetType.Audio});

        const newAudios = await getAssets<Audio>(txs);

        const newCursor = txs[txs.length-1]?.cursor ?? '';

        return {
            audios: [...audios, ...newAudios],
            cursor: newCursor
        }
    } catch (error) {
        console.error("Failed to Fetch My Audios:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Audios"
    );
});


export default fetchMyAudios;