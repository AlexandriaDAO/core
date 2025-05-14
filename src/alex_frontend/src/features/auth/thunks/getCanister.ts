import { ActorSubclass } from "@dfinity/agent";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { _SERVICE } from "../../../../../../src/declarations/asset_manager/asset_manager.did";

// Define the async thunk
const getCanister = createAsyncThunk<
	string, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>,
	}, //Argument that we pass to initialize
	{ rejectValue: string }
>( "auth/getCanister", async ( {actor}, { rejectWithValue }) => {
		try {
			const result = await actor.get_caller_asset_canister();

            if (result[0]) {
                const canisterId = result[0]?.assigned_canister_id;
                if (!canisterId) {
                    return rejectWithValue("No canister ID found");
                }
                return canisterId.toString();
            } else {
                return rejectWithValue("No canister ID found");
            }
		} catch (error) {
			console.error("Failed to fetch canister:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue("An unknown error occurred while fetching canister");
	}
);

export default getCanister;