import { ActorSubclass } from "@dfinity/agent";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { _SERVICE } from "../../../../../../src/declarations/user/user.did";
import { SerializedUser } from "../authSlice";
import { serializeUser } from "../utils/user";

// Define the async thunk
const upgrade = createAsyncThunk<
	SerializedUser, // This is the return type of the thunk's payload
	ActorSubclass<_SERVICE>, //Argument that we pass to initialize
	{ rejectValue: string }
>( "auth/upgrade", async ( actor,{ rejectWithValue }) => {
		try {
			const result = await actor.upgrade_to_librarian();

            if('Ok' in result) return serializeUser(result.Ok);

            if('Err' in result) throw new Error(result.Err)
		} catch (error) {
			console.error("Failed to Upgrade:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while Upgrading"
		);
	}
);

export default upgrade;