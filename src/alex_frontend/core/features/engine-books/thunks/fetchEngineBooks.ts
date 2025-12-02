import { Engine } from '../../../../../declarations/user/user.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from '@/store';
import { getBooks, Manifest } from '@/services/bookService';
import { Book } from '@/features/portal/portalSlice';
import { getNftManagerActor } from '@/features/auth/utils/authUtils';
import { natToArweaveId } from '@/utils/id_convert';
import { Principal } from "@dfinity/principal";
import { SerializedEngine } from '@/features/my-engines/myEnginesSlice';

// Define the async thunk
const fetchEngineBooks = createAsyncThunk<
    Book[], // This is the return type of the thunk's payload
    SerializedEngine, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("engineBooks/fetchEngineBooks", async (engine, { rejectWithValue, getState }) => {
    try {
        const actorNftManager = await getNftManagerActor();

        if (!engine) {
            throw new Error('Engine Not Provided');
        }

        const result = await actorNftManager.get_nfts_of(Principal.fromText(engine.owner));

        if ('Ok' in result) {
            //@ts-ignore
            const manifests:Manifest[] = result.Ok.map((token) => ({id: natToArweaveId(token[0])}) );

            return await getBooks(manifests);
        } else if ('Err' in result) {
            console.log('Error fetching NFTs', result.Err);
            // this will error out and eventually set books to [] array
            throw new Error('Error fetching NFTs');
        }else{
            // won't print errors
            return [];
        }
    } catch (error) {
        console.error("Failed to Fetch My Engines:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching an engine's books"
    );
});


export default fetchEngineBooks;