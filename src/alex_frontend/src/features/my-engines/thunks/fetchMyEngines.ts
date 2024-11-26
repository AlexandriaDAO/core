import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/user/user.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SerializedEngine } from '../myEnginesSlice';
import { serializeEngine } from '../utils';

const fetchMyEngines = createAsyncThunk<
    SerializedEngine[], // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("myEngines/fetchMyEngines", async (actor, { rejectWithValue }) => {
    try {
        const result = await actor.get_my_engines();

        return result.map(engine => serializeEngine(engine));
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