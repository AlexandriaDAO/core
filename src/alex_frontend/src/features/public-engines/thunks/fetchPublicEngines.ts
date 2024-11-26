import { _SERVICE } from '../../../../../declarations/user/user.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from '@dfinity/agent';
import { SerializedEngine } from '@/features/my-engines/myEnginesSlice';
import { serializeEngine } from '@/features/my-engines/utils';

// Define the async thunk
const fetchPublicEngines = createAsyncThunk<
    SerializedEngine[], // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("publicEngines/fetchPublicEngines", async (actor, { rejectWithValue }) => {
    try {
        const result = await actor.get_active_engines([]);

        return result.map(engine => serializeEngine(engine));
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