import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE as _SERVICENFTMANAGER } from '../../../../../declarations/nft_manager/nft_manager.did';
import { Engine } from '../../../../../declarations/alex_backend/alex_backend.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from '@/store';
import { getBooks } from '@/utils/irys';
import { Book } from '@/features/portal/portalSlice';

// Define the async thunk
const fetchEngineBooks = createAsyncThunk<
    Book[], // This is the return type of the thunk's payload
    {
        actorNftManager: ActorSubclass<_SERVICENFTMANAGER>,
        engine: Engine
    }, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("engineBooks/fetchEngineBooks", async ({actorNftManager, engine}, { rejectWithValue, getState }) => {
    try {
        // const {portal: {books}} = getState();

        // // Ensure activeEngine is a valid principal string
        // if (typeof engine !== 'string' || !engine) {
        //     throw new Error('Invalid engine provided');
        // }


        return [];

        // below code needs to be fixed
        // //@ts-ignore
        // const result = await actorNftManager.get_manifest_ids(BigInt(engine.owner));

        // if ('Ok' in result) {
        //     //@ts-ignore
        //     const manifestIds = result.Ok.map(token => token.description);
        //     const { portal: { books } } = getState();

        //     if (books.length > 0) {
        //         return books.filter(book => manifestIds.includes(book.manifest));
        //     }

        //     return await getBooks(result.Ok);
        // } else if ('Err' in result) {
        //     console.log('Error fetching NFTs', result.Err);
        //     // this will error out and eventually set books to [] array
        //     throw new Error('Error fetching NFTs');
        // }else{
        //     // won't print errors
        //     return [];
        // }
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