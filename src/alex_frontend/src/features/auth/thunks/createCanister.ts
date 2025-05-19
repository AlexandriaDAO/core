import { ActorSubclass } from "@dfinity/agent";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { _SERVICE as ASSET_MANAGER_SERVICE } from "../../../../../../src/declarations/asset_manager/asset_manager.did";
import { _SERVICE as LBRY_SERVICE} from "../../../../../../src/declarations/LBRY/LBRY.did";
import { RootState } from "@/store";
import { Principal } from "@dfinity/principal";

export const createCanister = createAsyncThunk<
	string, // Canister Id
	{
		assetManagerActor: ActorSubclass<ASSET_MANAGER_SERVICE>;
		lbryActor: ActorSubclass<LBRY_SERVICE>;
	}, //Argument that we pass to initialize
	{ rejectValue: string, state: RootState }
>(
	"auth/createCanister",
	async ({ assetManagerActor, lbryActor }, { rejectWithValue, getState }) => {
		try {
			const {user} = getState().auth;
			if(!user?.principal) throw new Error('Unauthenticated users not allowed.')

			const assetManagerCanisterId = process.env.CANISTER_ID_ASSET_MANAGER!;
			let amountFormatApprove: bigint = BigInt(
				Number((Number(10) + 0.04) * 10 ** 8).toFixed(0)
			);
			const checkApproval = await lbryActor.icrc2_allowance({
				account: {
					owner: Principal.fromText(user.principal),
					subaccount: [],
				},
				spender: {
					owner: Principal.fromText(assetManagerCanisterId),
					subaccount: [],
				},
			});

			if (checkApproval.allowance < amountFormatApprove) {
				const resultIcpApprove = await lbryActor.icrc2_approve({
					spender: {
						owner: Principal.fromText(assetManagerCanisterId),
						subaccount: [],
					},
					amount: amountFormatApprove,
					fee: [],
					memo: [],
					from_subaccount: [],
					created_at_time: [],
					expected_allowance: [],
					expires_at: [],
				});
				if ("Err" in resultIcpApprove) {
					const error = resultIcpApprove.Err;
					let errorMessage = "Unknown error"; // Default error message
					if ("InsufficientFunds" in error) {
						errorMessage = "Insufficient balance to process creation. Please swap/deposit some LBRY tokens";
					}
					if ("TemporarilyUnavailable" in error) {
						errorMessage = "Service is temporarily unavailable";
					}
					throw new Error(errorMessage);
				}
			}

			const result = await assetManagerActor.create_asset_canister([]);

			if ("Ok" in result) {
				return result.Ok.toString();
			}
			if ("Err" in result) {
				return rejectWithValue(result.Err.toString());
			}

			return rejectWithValue("Unexpected response format");
		} catch (error) {
			console.error("Error creating asset canister:", error);
			return rejectWithValue(
				error instanceof Error
					? error.message
					: "Unknown error occurred"
			);
		}
	}
);
