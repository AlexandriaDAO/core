import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from "../../../../../declarations/user/user.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SerializedUser } from '@/features/auth/authSlice';
import { serializeUser } from '@/features/auth/utils/user';


// Define the async thunk
const login = createAsyncThunk<
	SerializedUser, // This is the return type of the thunk's payload
	ActorSubclass<_SERVICE>, //Argument that we pass to initialize
	{ rejectValue: string }
>( "login/login", async ( actor, { rejectWithValue } ) => {
		try {
			const result = await actor.get_current_user();

            if('Ok' in result) return serializeUser(result.Ok);

            if('Err' in result) throw new Error(result.Err)
		} catch (error) {
			console.error("Failed to fetch current user:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue("An unknown error occurred while fetching self");
	}
);

export default login;
