import { ActorSubclass } from '@dfinity/agent';
import { Engine, _SERVICE } from '../../../../../declarations/ugd_backend/ugd_backend.did';
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
const fetchMyEngines = createAsyncThunk<
    Engine[], // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("myEngines/fetchMyEngines", async (actor, { rejectWithValue }) => {
    try {
        return await actor.get_my_engines()
    } catch (error) {
        console.error("Failed to Fetch My Engines:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Engines"
    );
});


export default fetchMyEngines;