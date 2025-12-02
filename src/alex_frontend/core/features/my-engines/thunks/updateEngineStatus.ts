import { createAsyncThunk } from "@reduxjs/toolkit";
import { _SERVICE } from "../../../../../../src/declarations/user/user.did";
import { ActorSubclass } from "@dfinity/agent";
import { SerializedEngine } from "@/features/my-engines/myEnginesSlice";
import { serializeEngine } from "@/features/my-engines/utils";


// Define the async thunk
const updateEngineStatus = createAsyncThunk<
    SerializedEngine, // This is the return type of the thunk's payload
    {
        actor: ActorSubclass<_SERVICE>,
        id: string,
        active: boolean,
    },
    { rejectValue: string }
>("myEngines/updateEngineStatus", async ({actor, id, active}, { rejectWithValue }) => {
    try {
        const result = await actor.update_engine_status({id: BigInt(id), active});

        if('Ok' in result) return serializeEngine(result.Ok);

        if('Err' in result) throw new Error(result.Err)
    } catch (error) {
        console.error("Failed to retrieve or authenticate client:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while initializing Authentication"
    );
});


export default updateEngineStatus;