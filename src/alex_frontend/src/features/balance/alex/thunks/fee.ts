import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../declarations/ALEX/ALEX.did";

interface FeeParams {
	actor: ActorSubclass<_SERVICE>;
}

const fee = createAsyncThunk<
	number,
	FeeParams,
	{ rejectValue: string }
>(
	"balance/alex/fee",
	async ({ actor }, { rejectWithValue }) => {
		try {
			const result = await actor.icrc1_fee();
			return Number(result) / 100000000; // Convert from e8s to ALEX
		} catch (error: any) {
			return rejectWithValue(error.message || "Failed to fetch ALEX fee");
		}
	}
);

export default fee;