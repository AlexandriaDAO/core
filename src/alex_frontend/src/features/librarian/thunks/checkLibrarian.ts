import { ActorSubclass } from '@dfinity/agent';
import { Librarian, _SERVICE } from '../../../../../declarations/alex_librarian/alex_librarian.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getActorAlexLibrarian, getAuthClient } from '@/features/auth/utils/authUtils';

// Define the async thunk
const checkLibrarian = createAsyncThunk<
    boolean, // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string }
>("librarian/checkLibrarian", async (_, { rejectWithValue }) => {
    try {
        const client = await getAuthClient();
        if (!client) {
            return rejectWithValue("Auth Client not initialized");
        }
        const actor = await getActorAlexLibrarian();
        return await actor.is_librarian()
    } catch (error) {
        console.error("Failed to Check Librarian Status:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while checking Librarian Status"
    );
});


export default checkLibrarian;