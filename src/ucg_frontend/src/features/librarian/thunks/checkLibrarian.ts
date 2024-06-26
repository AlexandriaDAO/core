import { ActorSubclass } from '@dfinity/agent';
import { Librarian, _SERVICE } from '../../../../../declarations/ucg_backend/ucg_backend.did';
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
const checkLibrarian = createAsyncThunk<
    boolean, // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("librarian/checkLibrarian", async (actor, { rejectWithValue }) => {
    try {
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