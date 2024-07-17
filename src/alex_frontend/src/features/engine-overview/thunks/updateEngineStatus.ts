import { AuthClient } from "@dfinity/auth-client";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Engine, _SERVICE } from "../../../../../../src/declarations/alex_backend/alex_backend.did";
import { ActorSubclass } from "@dfinity/agent";

export enum EngineStatus {
    Draft = 0,
    Published = 1,
}


// Define the async thunk
const updateEngineStatus = createAsyncThunk<
    Engine, // This is the return type of the thunk's payload
    {
        actor: ActorSubclass<_SERVICE>,
        engineId: string,
        status: EngineStatus
    }, //Argument that we pass to initialize
    { rejectValue: string }
>("engineOverview/updateEngineStatus", async ({actor, engineId, status}, { rejectWithValue }) => {
    try {

        const result = await actor.update_engine_status(engineId, status);

        if('Ok' in result) return result.Ok;

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