import { Engine } from '../../../../../declarations/alex_backend/alex_backend.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getActorAlexBackend, getAuthClient } from '../../auth/utils/authUtils';

const fetchMyEngines = createAsyncThunk<
    Engine[], // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string }
>("myEngines/fetchMyEngines", async (_, { rejectWithValue }) => {
    try {
        const client = await getAuthClient();
        if(await client.isAuthenticated()){
            const actor = await getActorAlexBackend();
            return await actor.get_my_engines()
        }

        return rejectWithValue("User is not Authenticated");
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