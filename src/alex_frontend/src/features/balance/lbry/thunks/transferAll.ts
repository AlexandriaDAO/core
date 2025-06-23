import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICELBRY } from "../../../../../../declarations/LBRY/LBRY.did";
import { _SERVICE as _SERVICENFTMANAGER } from "../../../../../../declarations/nft_manager/nft_manager.did";

interface TransferAllParams {
	nftManagerActor: ActorSubclass<_SERVICENFTMANAGER>;
	userPrincipal: string;
}

const transferAll = createAsyncThunk<
	void,
	TransferAllParams,
	{ rejectValue: string }
>(
	"balance/lbry/transferAll",
	async ({ nftManagerActor, userPrincipal }, { rejectWithValue }) => {
		try {
			console.log("LBRY transferAll thunk started", { userPrincipal });

			console.log("Calling nftManagerActor.withdraw_topup()");
			const result = await nftManagerActor.withdraw_topup();

			console.log("Transfer all result:", result);
			if("Ok" in result) return;

			if("Err" in result) {
				console.log('An error occurred', result.Err);
				throw result.Err;
			}

			throw new Error('Received an Unknown Response.')
		} catch (error: any) {
			console.error("LBRY transfer all error:", error);
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue("An unknown error occurred while transferring all LBRY from locked balance");
		}
	}
);

export default transferAll;