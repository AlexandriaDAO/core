import { createAsyncThunk } from "@reduxjs/toolkit";
import Arweave from "arweave";
// import { WalletDAO } from "@/features/wallets/utils/wallet_dao";
import { JWKInterface } from "arweave/node/lib/wallet";

// Define the async thunk
const importKeyFile = createAsyncThunk<
	{ address: string, key: JWKInterface }, // This is the return type of the thunk's payload
	string,
	{ rejectValue: string }
>(
	"addWallet/importKeyFile",
	async ( content, { rejectWithValue } ) => {
		try {
			const arweave = Arweave.init({});

			// const walletDao = new WalletDAO(arweave);

			const key: JWKInterface = JSON.parse(content);

			const address = await arweave.wallets.jwkToAddress(key);

			return { address, key };
		} catch (error) {
			console.error("Failed to import key file:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while importing key file"
		);
	}
);

export default importKeyFile;