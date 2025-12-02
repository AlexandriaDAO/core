import { createAsyncThunk } from "@reduxjs/toolkit";
import { _SERVICE } from "../../../../../../src/declarations/user/user.did";
import { ActorSubclass } from "@dfinity/agent";
import { SerializedEngine } from "@/features/my-engines/myEnginesSlice";
import { serializeEngine } from "@/features/my-engines/utils";


// Define the async thunk
const fetchEngine = createAsyncThunk<
    SerializedEngine, // This is the return type of the thunk's payload
    {
        actor: ActorSubclass<_SERVICE>,
        id: string,
    },
    { rejectValue: string }
>("engineOverview/fetchEngine", async ({actor, id}, { rejectWithValue }) => {
    try {
        const result = await actor.get_engines([BigInt(id)]);

        if('Ok' in result && result.Ok.length>0) return serializeEngine(result.Ok[0]);

        if('Err' in result) throw new Error(result.Err)
    } catch (error) {
        console.error("Failed to retrieve Engine:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching Engine"
    );
});


export default fetchEngine;