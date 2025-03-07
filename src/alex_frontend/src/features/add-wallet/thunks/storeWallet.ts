import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE, PublicKey } from "../../../../../declarations/alex_wallet/alex_wallet.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ibe_encrypt } from "@/services/vetkdService";
import { SerializedWallet } from "../../wallets/walletsSlice";
import { serializeWallet } from "../../wallets/utils";
import { RootState } from "@/store";

const alex_wallet_canister_id = process.env.CANISTER_ID_ALEX_WALLET!;

// Define the async thunk
const storeWallet = createAsyncThunk<
	SerializedWallet, // This is the return type of the thunk's payload
	ActorSubclass<_SERVICE>,
	{ rejectValue: string, state: RootState }
>(
	"addWallet/storeWallet",
	async (
		actor,
		{ rejectWithValue, getState }
	) => {
		try {
			const {wallet} = getState().addWallet;

			if (!wallet) return rejectWithValue("Wallet not found");

			const skey = {
				d: wallet.key.d,
				p: wallet.key.p,
				q: wallet.key.q,
				dp: wallet.key.dp,
				dq: wallet.key.dq,
				qi: wallet.key.qi,
			}

			const pkey: PublicKey = {
				kty: wallet.key.kty,
				e: wallet.key.e,
				n: wallet.key.n,
			}

			const encrypted_key = await ibe_encrypt(JSON.stringify(skey), alex_wallet_canister_id);

			const result = await actor.create_wallet({key: encrypted_key, public: pkey});

            if('Ok' in result) return serializeWallet(result.Ok);

            if('Err' in result) throw new Error(result.Err)
		} catch (error) {
			console.error("Failed to Add Wallet:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while adding Wallet"
		);
	}
);

export default storeWallet;