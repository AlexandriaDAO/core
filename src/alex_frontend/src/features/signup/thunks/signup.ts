import { ActorSubclass } from "@dfinity/agent";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { _SERVICE } from "../../../../../../src/declarations/user/user.did";
import { SerializedUser } from "@/features/auth/authSlice";
import { serializeUser } from "@/features/auth/utils/user";

// Define the async thunk
const signup = createAsyncThunk<
	SerializedUser, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>,
		username: string,
	}, //Argument that we pass to initialize
	{ rejectValue: string }
>(
	"auth/signup",
	async (
		{actor, username},
		{ rejectWithValue }
	) => {
		try {
			const result = await actor.signup({username});

            if('Ok' in result) return serializeUser(result.Ok);

            if('Err' in result) throw new Error(result.Err)
		} catch (error) {
			console.error("Failed to Signup:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while Upgrading"
		);
	}
);

export default signup;