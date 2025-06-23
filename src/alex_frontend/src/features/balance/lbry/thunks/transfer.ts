import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICELBRY, TransferArg } from "../../../../../../declarations/LBRY/LBRY.did";
import { _SERVICE as _SERVICENFTMANAGER } from "../../../../../../declarations/nft_manager/nft_manager.did";
import { Account } from "@dfinity/ledger-icp";

interface TransferParams {
	nftManagerActor: ActorSubclass<_SERVICENFTMANAGER>;
	lbryActor: ActorSubclass<_SERVICELBRY>;
	amount: string;
	userPrincipal: string;
}

const transfer = createAsyncThunk<
	void,
	TransferParams,
	{ rejectValue: string }
>(
	"balance/lbry/transfer",
	async ({ nftManagerActor, lbryActor, amount, userPrincipal }, { rejectWithValue }) => {
		try {
			console.log("LBRY transfer thunk started", { amount, userPrincipal });

			const nftManagerId = process.env.CANISTER_ID_NFT_MANAGER!;

			if (!nftManagerId) {
				throw new Error("NFT Manager canister ID not found in environment variables");
			}

			console.log("Converting principal and getting subaccount");
			const subaccount = await nftManagerActor.principal_to_subaccount(
				Principal.fromText(userPrincipal)
			);

			console.log("Executing LBRY transfer", { amount, nftManagerId, subaccount });

			const amountFormat = BigInt(Math.floor(Number(amount) * 10 ** 8));
			const recipientAccount: Account = {
				owner: Principal.fromText(nftManagerId),
				subaccount: [Array.from(subaccount)],
			};

			const transferArg: TransferArg = {
				to: recipientAccount,
				fee: [],
				memo: [],
				from_subaccount: [],
				created_at_time: [],
				amount: amountFormat
			};

			const result = await lbryActor.icrc1_transfer(transferArg);
			if ("Ok" in result) {
				console.log("LBRY transfer successful");
				return;
			} 
			if("Err" in result) {
				console.log("LBRY transfer error:", result.Err);
				throw result.Err;
			}

			throw new Error('Received an Unknown Response.')
		} catch (error: any) {
			console.error("LBRY transfer error:", error);
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue("An unknown error occurred while transferring LBRY to locked balance");
		}
	}
);

export default transfer;