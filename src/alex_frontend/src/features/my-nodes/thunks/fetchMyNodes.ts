import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/user/user.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SerializedNode } from '../myNodesSlice';
import { serializeNode } from '../utils';

// Define the async thunk
const fetchMyNodes = createAsyncThunk<
    SerializedNode[], // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("myNodes/fetchMyNodes", async (actor, { rejectWithValue }) => {
    try {
        const result = await actor.get_my_nodes()

        return result.map(node => serializeNode(node));
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