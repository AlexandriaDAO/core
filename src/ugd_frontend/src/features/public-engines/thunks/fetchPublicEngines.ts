import { ActorSubclass } from '@dfinity/agent';
import { Engine, _SERVICE } from '../../../../../declarations/ugd_backend/ugd_backend.did';
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
const fetchPublicEngines = createAsyncThunk<
    Engine[], // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("publicEngines/fetchPublicEngines", async (actor, { rejectWithValue }) => {
    try {
        return await actor.get_engines_not_owned_by_me()
    } catch (error) {
        console.error("Failed to Fetch Public Engines:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching Public Engines"
    );
});


export default fetchPublicEngines;