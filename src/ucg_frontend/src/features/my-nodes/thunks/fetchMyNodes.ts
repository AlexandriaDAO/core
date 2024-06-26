import { ActorSubclass } from '@dfinity/agent';
import { Node, _SERVICE } from '../../../../../declarations/ucg_backend/ucg_backend.did';
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
const fetchMyNodes = createAsyncThunk<
    Node[], // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("myNodes/fetchMyNodes", async (actor, { rejectWithValue }) => {
    try {
        return await actor.get_my_nodes()
    } catch (error) {
        console.error("Failed to Fetch My Nodes:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Nodes"
    );
});


export default fetchMyNodes;