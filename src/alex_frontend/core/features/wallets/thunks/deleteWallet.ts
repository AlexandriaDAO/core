import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../declarations/alex_wallet/alex_wallet.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SerializedWallet } from "../walletsSlice";

// Define the async thunk
const deleteWallet = createAsyncThunk<
	boolean, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>,
		wallet: SerializedWallet,
	},
	{ rejectValue: string }
>( "wallets/deleteWallet", async ({ actor, wallet }, { rejectWithValue }) => {
		try {
			const result = await actor.delete_wallet(BigInt(wallet.id));

            if('Ok' in result) return true;

            if('Err' in result) throw new Error(result.Err)

            return false;
		} catch (error) {
			console.error("Failed to Delete Wallet:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while deleting Wallet"
		);
	}
);

export default deleteWallet;
