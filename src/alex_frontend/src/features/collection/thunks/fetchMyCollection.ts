import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAssets } from '@/services/assetService';
import { RootState } from '@/store';
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../src/declarations/nft_manager/nft_manager.did";
import { Principal } from "@dfinity/principal";
import { natToArweaveId } from "@/utils/id_convert";

// Define the async thunk
const fetchMyCollection = createAsyncThunk<
    string[], // This is the return type of the thunk's payload
    {actor: ActorSubclass<_SERVICE>}, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("collection/fetchMyCollection", async ({actor}, { rejectWithValue, getState }) => {
    try {
        const {collection: {collection}, auth: {user}} = getState();

        if(!user || !user.principal) return collection;

        const result = await actor.get_nfts_of(Principal.fromText(user.principal));

        if ('Ok' in result) {
            const ids = result.Ok.map((token) => natToArweaveId(token[0]));

            return ids;
        }

        if('Err' in result) {
            console.log('Error fetching NFTs', result.Err);
            // this will error out and eventually set collection to [] array
            throw new Error('Error fetching NFTs');
        }

        return collection;
    } catch (error) {
        console.error("Failed to Fetch My Collection:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Collection"
    );
});


export default fetchMyCollection;



