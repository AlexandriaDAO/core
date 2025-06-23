import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE, TransferArgs } from "../../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";

interface WithdrawParams {
	actor: ActorSubclass<_SERVICE>;
	amount: string;
	destination: string;
	accountType: string;
}

const withdraw = createAsyncThunk<
	void,
	WithdrawParams,
	{ rejectValue: string }
>(
	"balance/icp/withdraw",
	async ({ actor, amount, destination, accountType }, { rejectWithValue }) => {
		try {
			const amountFormat = {
				e8s: BigInt(Math.floor(Number(amount) * 10 ** 8)),
			};

			let recipientAccountId: AccountIdentifier;
			if (accountType === "principal") {
				const recipientPrincipal = Principal.fromText(destination);
				recipientAccountId = AccountIdentifier.fromPrincipal({
					principal: recipientPrincipal,
				});
			} else {
				recipientAccountId = AccountIdentifier.fromHex(destination);
			}

			const transferArg: TransferArgs = {
				to: recipientAccountId.toUint8Array(),
				fee: { e8s: BigInt(10000) },
				memo: BigInt(250),
				from_subaccount: [],
				created_at_time: [],
				amount: amountFormat,
			};

			const result = await actor.transfer(transferArg);
			if ("Ok" in result) return;
			if ("Err" in result) throw result.Err;

			throw new Error('Received an Unknown Response.')
		} catch (error) {
			console.error(error);
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue("An unknown error occurred while withdrawing");
		}
	}
);

export default withdraw;