import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/user/user.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { serializeNode } from '@/features/my-nodes/utils';
import { SerializedNode } from '@/features/my-nodes/myNodesSlice';

// Define the async thunk
const fetchNodes = createAsyncThunk<
    SerializedNode[], // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("uploadSlice/fetchNodes", async (actor, { rejectWithValue }) => {
    try {
        const result = await actor.get_active_nodes([])

        return result.map(node => serializeNode(node));
    } catch (error) {
        console.error("Failed to Fetch Nodes:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching Nodes"
    );
});


export default fetchNodes;