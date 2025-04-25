import { createAsyncThunk } from "@reduxjs/toolkit";

import { arweaveIdToNat } from "@/utils/id_convert";
import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent/lib/cjs";

import { _SERVICE as EMPORIUM_SERVICE } from "../../../../../../declarations/emporium/emporium.did";
import { _SERVICE as ICP_LEDGER_SERVICE } from "../../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";
import { RootState } from "@/store";

const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;

const purchase = createAsyncThunk<
	void,
	{
		id: string;
		price: string;

		actorEmporium: ActorSubclass<EMPORIUM_SERVICE>;
		actorIcpLedger: ActorSubclass<ICP_LEDGER_SERVICE>;
	},
	{ rejectValue: string; state: RootState } // Reject type
>(
	"imporium/listings/purchase",
	async (
		{ id, price, actorEmporium, actorIcpLedger },
		{ rejectWithValue, getState }
	) => {
		try {
			const { user } = getState().auth;
			if (!user) throw new Error("User not found");
			const tokenId = arweaveIdToNat(id);
			let amountFormatApprove: bigint = BigInt(
				Number((Number(price) + 0.0001) * 10 ** 8).toFixed(0)
			);
			const checkApproval = await actorIcpLedger.icrc2_allowance({
				account: {
					owner: Principal.fromText(user.principal),
					subaccount: [],
				},
				spender: {
					owner: Principal.fromText(emporium_canister_id),
					subaccount: [],
				},
			});

			if (checkApproval.allowance < amountFormatApprove) {
				const resultIcpApprove = await actorIcpLedger.icrc2_approve({
					spender: {
						owner: Principal.fromText(emporium_canister_id),
						subaccount: [],
					},
					amount: amountFormatApprove,
					fee: [BigInt(10000)],
					memo: [],
					from_subaccount: [],
					created_at_time: [],
					expected_allowance: [],
					expires_at: [],
				});
				if ("Err" in resultIcpApprove) {
					const error = resultIcpApprove.Err;
					let errorMessage = "Unknown error"; // Default error message
					if ("TemporarilyUnavailable" in error) {
						errorMessage = "Service is temporarily unavailable";
					}
					throw new Error(errorMessage);
				}
			}
			const result = await actorEmporium.buy_nft(tokenId);

			if ("Err" in result) throw new Error(result?.Err);
		} catch (error) {
			console.error("Error buying NFT:", error);
			return rejectWithValue(
				"An error occurred while buying the NFT." + error
			);
		}
	}
);

export default purchase;
