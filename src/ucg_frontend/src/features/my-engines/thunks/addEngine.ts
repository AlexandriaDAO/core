import { ActorSubclass } from "@dfinity/agent";
import {
	Engine,
	_SERVICE,
} from "../../../../../declarations/ucg_backend/ucg_backend.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { EngineStatus } from "@/features/engine-overview/thunks/updateEngineStatus";

// Define an interface for the engine parameters based on the Yup validation schema
interface EngineInput {
	title: string;
	host: string;
	key: string;
	index: string;
	status?: EngineStatus; // Optional since it's not enforced by 'required' in Yup
}

// Define the async thunk
const addEngine = createAsyncThunk<
	Engine, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>;
		engine: EngineInput;
	}, //Argument that we pass to initialize
	{ rejectValue: string }
>(
	"myEngines/addEngine",
	async (
		{
			actor,
			engine: { title, host, key, index, status = EngineStatus.Draft  },
		},
		{ rejectWithValue }
	) => {
		try {
			const result = await actor.add_my_engine(title, host, key, index, [status]);

            if('Ok' in result) return result.Ok;

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
