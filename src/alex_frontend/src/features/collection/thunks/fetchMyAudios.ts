import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAssets, getAssets } from '@/services/assetService';
import { RootState } from "@/store";
import { AssetType } from "@/features/upload/uploadSlice";
import { Audio } from "@/features/asset/types";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../src/declarations/nft_manager/nft_manager.did";

// Define the async thunk
const fetchMyAudios = createAsyncThunk<
    {
        audios: Audio[],
        cursor: string,
    }, // This is the return type of the thunk's payload
    {actor: ActorSubclass<_SERVICE>}, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("collection/fetchMyAudios", async ({actor}, { rejectWithValue, getState }) => {
    try {

        const {collection: {collection, cursor, audios }, auth: {user}} = getState();

        if(!user || !user.principal) return { audios, cursor }

        if (collection.length > 0) {

            const txs = await fetchAssets({after: cursor, owner: user.principal, type: AssetType.Audio, ids: collection});

            const newAudios = await getAssets<Audio>(txs);

            const newCursor = txs[txs.length-1]?.cursor ?? '';

            return {
                audios: [...audios, ...newAudios],
                cursor: newCursor
            }

        }

        return { audios, cursor }

    } catch (error) {
        console.error("Failed to Fetch My Minted Audios:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Minted Audios"
    );
});


export default fetchMyAudios;