import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../declarations/stripe/stripe.did";
import { RootState } from "@/store";

const swap = createAsyncThunk<
	void,
	ActorSubclass<_SERVICE>,
	{ rejectValue: string, state: RootState }
>(
	"balance/usd/swap",
	async (stripe, { rejectWithValue, getState }) => {
		try {
			const {user} = getState().auth;

			// Validate user is logged in
			if (!user?.principal) {
				return rejectWithValue("User is not authenticated");
			}

			const result = await stripe.swap_usd_to_icp();

			if ("Ok" in result) return;
			if ("Err" in result) {
				return rejectWithValue(result.Err);
			}

			throw new Error('Received an Unknown Response.')
		} catch (error) {
			console.error(error);
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue("An unknown error occurred while swapping");
	}
);

export default swap;