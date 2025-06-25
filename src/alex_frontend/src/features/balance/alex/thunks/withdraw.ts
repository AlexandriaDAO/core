import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE, TransferArg } from "../../../../../../declarations/ALEX/ALEX.did";
import { Principal } from "@dfinity/principal";
import { Account } from "@dfinity/ledger-icp";

interface WithdrawParams {
	actor: ActorSubclass<_SERVICE>;
	amount: string;
	destination: string;
}

const withdraw = createAsyncThunk<
	void,
	WithdrawParams,
	{ rejectValue: string }
>(
	"balance/alex/withdraw",
	async ({ actor, amount, destination }, { rejectWithValue }) => {
		try {
			const amountFormat = BigInt(Math.floor(Number(amount) * 10 ** 8));
			const recipientAccount: Account = {
				owner: Principal.fromText(destination),
				subaccount: [],
			};

			const transferArg: TransferArg = {
				to: recipientAccount,
				fee: [], // default fee
				memo: [],
				from_subaccount: [],
				created_at_time: [],
				amount: amountFormat
			};

			const result = await actor.icrc1_transfer(transferArg);
			if ("Ok" in result) return;

			if("Err" in result) {
				console.log("error is ", result.Err);
				throw result.Err;
			}

			throw new Error('Received an Unknown Response.')
		} catch (error: any) {
			console.error(error);
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue("An unknown error occurred while withdrawing ALEX");
		}
	}
);

export default withdraw;