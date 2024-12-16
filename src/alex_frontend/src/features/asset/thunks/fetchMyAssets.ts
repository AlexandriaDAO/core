import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAssets } from '@/services/assetService';
import { RootState } from '@/store';
import { Asset } from "../types";

// Define the async thunk
const fetchMyAssets = createAsyncThunk<
    Asset[], // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("asset/fetchMyAssets", async (_, { rejectWithValue, getState }) => {
    try {
        const {asset: {cursor, assets}, auth: {user}} = getState();

        if(!user || !user.principal) return assets;

        const txs = await fetchAssets({after: cursor, owner: user.principal });

        return txs;
    } catch (error) {
        console.error("Failed to Fetch My Assets:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Assets"
    );
});


export default fetchMyAssets;



