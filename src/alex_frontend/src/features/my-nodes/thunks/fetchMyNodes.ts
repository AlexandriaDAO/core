import { getActorAlexLibrarian, getAuthClient } from '@/features/auth/utils/authUtils';
import { Node } from '../../../../../declarations/alex_librarian/alex_librarian.did';
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
const fetchMyNodes = createAsyncThunk<
    Node[], // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string }
>("myNodes/fetchMyNodes", async (_, { rejectWithValue }) => {
    try {
        const client = await getAuthClient();
        if (await client.isAuthenticated()) {
            const actor = await getActorAlexLibrarian();
            return await actor.get_my_nodes()
        }

        return rejectWithValue("User is not Authenticated");
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