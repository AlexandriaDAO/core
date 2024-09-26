import { ActorSubclass } from "@dfinity/agent";
import {
	Engine,
	_SERVICE as _SERVICE_ALEX_BACKEND,
} from "../../../../../declarations/alex_backend/alex_backend.did";
import {
	_SERVICE as _SERVICE_VETKD,
} from "../../../../../declarations/vetkd/vetkd.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { EngineStatus } from "@/features/engine-overview/thunks/updateEngineStatus";
import { ibe_encrypt } from "@/services/vetkdService";

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
		actorAlexBackend: ActorSubclass<_SERVICE_ALEX_BACKEND>;
		actorVetkd: ActorSubclass<_SERVICE_VETKD>;
		engine: EngineInput;
	}, //Argument that we pass to initialize
	{ rejectValue: string }
>(
	"myEngines/addEngine",
	async (
		{
			actorAlexBackend,
			actorVetkd,
			engine: { title, host, key, index, status = EngineStatus.Draft  },
		},
		{ rejectWithValue }
	) => {
		try {
			const frontend_canister_id = process.env.CANISTER_ID_ALEX_FRONTEND!;

			const encrypted_key = await ibe_encrypt(actorVetkd, key, frontend_canister_id);

			const result = await actorAlexBackend.add_my_engine(title, host, encrypted_key, index, [status]);

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
