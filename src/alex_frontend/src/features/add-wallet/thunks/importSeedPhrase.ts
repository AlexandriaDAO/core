import { createAsyncThunk } from "@reduxjs/toolkit";
import * as bip39 from "bip39";
import { JWKInterface } from "arweave/node/lib/wallet";
import { WalletDAO } from "../utils/wallet_dao";
import { SeedPhrase } from "../types";
import { arweaveClient } from "@/utils/arweaveClient";

// Define the async thunk
const importSeedPhrase = createAsyncThunk<
	{ address: string, key: JWKInterface, seed: string }, // This is the return type of the thunk's payload
	string,
	{ rejectValue: string }
>(
	"addWallet/importSeedPhrase",
	async (
		seed,
		{ rejectWithValue }
	) => {
		try {
			if (!bip39.validateMnemonic(seed)) return rejectWithValue("Invalid seed phrase");

			const walletDao = new WalletDAO(arweaveClient);

			const wallet = await walletDao.generateJWKWallet(new SeedPhrase(seed));

			const key = wallet["jwk"] || wallet;

			const address = await arweaveClient.wallets.jwkToAddress(key);

			return { address, key, seed };
		} catch (error) {
			console.error("Failed to import seed phrase:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while importing seed phrase"
		);
	}
);

export default importSeedPhrase;