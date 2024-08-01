import { ActorSubclass } from '@dfinity/agent';
import { Engine, TokenDetail, _SERVICE } from '../../../../../declarations/alex_backend/alex_backend.did';
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
const fetchEngineBooks = createAsyncThunk<
    TokenDetail[], // This is the return type of the thunk's payload
    {
        actor: ActorSubclass<_SERVICE>,
        engine: string
    }, //Argument that we pass to initialize
    { rejectValue: string }
>("engineBooks/fetchEngineBooks", async ({actor, engine}, { rejectWithValue }) => {
    try {
        // Ensure activeEngine is a valid principal string
        if (typeof engine !== 'string' || !engine) {
            throw new Error('Invalid engine provided');
        }

        const result = await actor.get_nfts_of(engine);

        if ('Ok' in result) {
            return result.Ok
        }

        throw new Error(result.Err ?? 'Unknown Error Occured');
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