import { createAsyncThunk } from "@reduxjs/toolkit";
import { JWKInterface } from "arweave/node/lib/wallet";
import { WalletDAO } from "../utils/wallet_dao";
import { arweaveClient } from "@/utils/arweaveClient";

// Define the async thunk
const generateNewWallet = createAsyncThunk<
	{ address: string, key: JWKInterface, seedPhrase: string }, // This is the return type of the thunk's payload
	void,
	{ rejectValue: string }
>(
	"addWallet/generateNewWallet",
	async ( _, { rejectWithValue } ) => {
		try {
			const walletDao = new WalletDAO(arweaveClient);

			const seedPhrase = await walletDao.generateSeedPhrase();
			const wallet = await walletDao.generateJWKWallet(seedPhrase);
			const key = wallet["jwk"] || wallet;
			const address = await arweaveClient.wallets.jwkToAddress(key);
			return {
				address,
				key,
				seedPhrase: seedPhrase.toString(),
			};
		} catch (error) {
			console.error("Failed to generate new wallet:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while generating new wallet"
		);
	}
);

export default generateNewWallet;