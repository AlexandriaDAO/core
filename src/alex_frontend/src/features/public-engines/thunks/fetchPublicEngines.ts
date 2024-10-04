import { Engine } from '../../../../../declarations/alex_backend/alex_backend.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getActorAlexBackend, getAuthClient } from '@/features/auth/utils/authUtils';

// Define the async thunk
const fetchPublicEngines = createAsyncThunk<
    Engine[], // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string }
>("publicEngines/fetchPublicEngines", async (_, { rejectWithValue }) => {
    try {
        const actor = await getActorAlexBackend();
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