import { RootState } from "@/store";
import { AuthClient } from "@dfinity/auth-client";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getClient, getPrincipal } from "../services/authService";

// Define the async thunk
const principal = createAsyncThunk<
    string, // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string }
>("auth/principal", async (_, { rejectWithValue }) => {
    try {
        const client = await getClient();

        if (!await client.isAuthenticated()) throw new Error("User is not Authenticated");

        return getPrincipal(client);

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


export default principal;