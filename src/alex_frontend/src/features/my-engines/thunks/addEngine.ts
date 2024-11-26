import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from "../../../../../declarations/user/user.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ibe_encrypt } from "@/services/vetkdService";
import { SerializedEngine } from '../myEnginesSlice';
import { serializeEngine } from '../utils';

// Define an interface for the engine parameters based on the Yup validation schema
interface EngineInput {
	title: string;
	host: string;
	key: string;
	index: string;
	active: boolean; // Optional since it's not enforced by 'required' in Yup
}

// Define the async thunk
const addEngine = createAsyncThunk<
	SerializedEngine, // This is the return type of the thunk's payload
	{
		actor:ActorSubclass<_SERVICE>,
		values:EngineInput
	},//Argument that we pass to initialize
	{ rejectValue: string }
>(
	"myEngines/addEngine",
	async (
		{ actor, values: {title, host, key, index, active = false } },
		{ rejectWithValue }
	) => {
		try {
			const frontend_canister_id = process.env.CANISTER_ID_ALEX_FRONTEND!;

			const encrypted_key = await ibe_encrypt( key, frontend_canister_id);

			const result = await actor.create_engine({title, host, key:encrypted_key, index, active});

            if('Ok' in result) return serializeEngine(result.Ok);

            if('Err' in result) throw new Error(result.Err)
		} catch (error) {
			console.error("Failed to Add Engine:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while adding Engine"
		);
	}
);

export default addEngine;
