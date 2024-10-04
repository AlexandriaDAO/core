import { Engine } from '../../../../../declarations/alex_backend/alex_backend.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from '@/store';
import { getBooks } from '@/services/bookService';
import { Book } from '@/features/portal/portalSlice';
// import { getNftManagerActor } from '@/features/auth/utils/authUtils';

// Define the async thunk
const fetchEngineBooks = createAsyncThunk<
    Book[], // This is the return type of the thunk's payload
    Engine, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("engineBooks/fetchEngineBooks", async (engine, { rejectWithValue, getState }) => {
    try {
        // const actorNftManager = await getNftManagerActor();
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