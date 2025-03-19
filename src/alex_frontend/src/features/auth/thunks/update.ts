import { ActorSubclass } from "@dfinity/agent";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { _SERVICE, UpdateUserRequest } from "../../../../../../src/declarations/user/user.did";
import { SerializedUser } from "../authSlice";
import { serializeUser } from "../utils/user";

// Define the async thunk
const update = createAsyncThunk<
	SerializedUser, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>,
		input: {
			username: string,
			name?: string,
			avatar?: string
		}
	}, //Argument that we pass to initialize
	{ rejectValue: string }
>( "auth/update", async ( {actor, input: {name, avatar, username}},{ rejectWithValue }) => {
		try {
			const updateInput:UpdateUserRequest = {
				username: username,
				name: name ? [name]: [],
				avatar: avatar ? [avatar]: []
			}
			const result = await actor.update_profile(updateInput);

            if('Ok' in result) return serializeUser(result.Ok);

            if('Err' in result) throw new Error(result.Err)
		} catch (error) {
			console.error("Failed to Update Profile:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue("An unknown error occurred while Upgrading");
	}
);

export default update;