import { ActorSubclass } from "@dfinity/agent";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { _SERVICE } from "../../../../../../src/declarations/asset_manager/asset_manager.did";

// Define the async thunk
const getCanisters = createAsyncThunk<
	Record<string, string>, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>,
	}, //Argument that we pass to initialize
	{ rejectValue: string }
>( "auth/getCanisters", async ( {actor}, { rejectWithValue }) => {
		try {
			const result = await actor.get_all_user_asset_canisters();

			const canisters: Record<string, string> = {};

			result.forEach(([owner, canister]) => {
				canisters[owner.toString()] = canister.assigned_canister_id.toString();
			});

			return canisters;
		} catch (error) {
			console.error("Failed to fetch canisters:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue("An unknown error occurred while fetching canisters");
	}
);

export default getCanisters;