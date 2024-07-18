import { RootState } from "@/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";

// Define the async thunk
const logout = createAsyncThunk<
  void, // This is the return type of the thunk's payload
  AuthClient, //Argument that we pass to initialize
  { rejectValue: string; state: RootState }
>("auth/logout", async (client, { rejectWithValue }) => {
  try {
    if (await client.isAuthenticated()) {
      await client.logout();
    }
  } catch (error) {
    console.error("Failed to logout User:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
});

export default logout;
