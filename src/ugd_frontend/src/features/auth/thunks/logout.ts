import { RootState } from "@/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getClient } from "../services/authService";

// Define the async thunk
const logout = createAsyncThunk<
    void, // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("auth/logout", async (_, { rejectWithValue }) => {
    try {
        const client = await getClient();

        if (await client.isAuthenticated()){
            client.logout();
        }
    } catch (error) {
        console.error("Failed to logout User:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
});


export default logout;