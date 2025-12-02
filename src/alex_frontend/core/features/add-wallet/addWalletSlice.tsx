import { createSlice } from "@reduxjs/toolkit";
import { JWKInterface } from "arweave/node/lib/wallet";
import { toast } from "sonner";

import importKeyFile from "./thunks/importKeyFile";
import importSeedPhrase from "./thunks/importSeedPhrase";
import generateNewWallet from "./thunks/generateNewWallet";

interface UserWallet {
	new?: boolean;
	key: JWKInterface;
	seed?: string;
	address: string;
}

interface AddWalletState {
	wallet: UserWallet | null;

	importing: boolean;
	importError: string | null;

	generating: boolean;
	generateError: string | null;

	storing: boolean;
	storeError: string | null;
}

const initialState: AddWalletState = {
	wallet: null,

	importing: false,
	importError: null,

	generating: false,
	generateError: null,

	storing: false,
	storeError: null,
};

const addWalletSlice = createSlice({
	name: "addWallet",
	initialState,
	reducers: {
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			// Import Key File
			.addCase(importKeyFile.pending, (state) => {
				state.importing = true;
			})
			// .addCase(importKeyFile.fulfilled, (state, action) => {
			// 	state.importing = false;
			// 	state.wallet = {
			// 		address: action.payload.address,
			// 		key: action.payload.key,
			// 	};
			// 	toast.success("Wallet imported successfully");
			// })
			.addCase(importKeyFile.fulfilled, (state, action) => {
				state.importing = false;

				// Check if payload is valid
				if (action.payload?.address && action.payload?.key) {
					state.wallet = {
						address: action.payload.address,
						key: action.payload.key,
					};
					toast.success("Wallet imported successfully");
				} else {
					state.wallet = null; // Set wallet to null if payload is invalid
					toast.error("Invalid key file. Please try again.");
				}
			})
			.addCase(importKeyFile.rejected, (state, action) => {
				state.importing = false;
				state.importError = action.payload as string;
				toast.error("Error importing wallet. Please check your key file.");
			})

			// Import Seed Phrase
			.addCase(importSeedPhrase.pending, (state) => {
				state.importing = true;
			})
			.addCase(importSeedPhrase.fulfilled, (state, action) => {
				state.importing = false;
				state.wallet = {
					address: action.payload.address,
					key: action.payload.key,
					seed: action.payload.seed,
				};
				toast.success("Wallet imported successfully");
			})
			.addCase(importSeedPhrase.rejected, (state, action) => {
				state.importing = false;
				state.importError = action.payload as string;
				toast.error("Error creating wallet from seed phrase.");
			})

			// Generate New Wallet
			.addCase(generateNewWallet.pending, (state) => {
				state.generating = true;
			})
			.addCase(generateNewWallet.fulfilled, (state, action) => {
				state.generating = false;
				state.wallet = {
					new: true,
					address: action.payload.address,
					key: action.payload.key,
					seed: action.payload.seedPhrase,
				};
				toast.success("New wallet generated! Please save your key file safely.");
			})
			.addCase(generateNewWallet.rejected, (state, action) => {
				state.generating = false;
				state.generateError = action.payload as string;
				toast.error("Error generating new wallet.");
			});
	},
});

export const { reset } = addWalletSlice.actions;
export default addWalletSlice.reducer;
