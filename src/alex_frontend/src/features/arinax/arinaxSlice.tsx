import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import fetchWallets from "./thunks/fetchWallets";
import uploadFile from "./thunks/uploadFile";
import mintNFT from "./thunks/mintNFT";
import estimateCost from "./thunks/estimateCost";
import { SerializedWallet } from "../wallets/walletsSlice";
import fetchBalance from "./thunks/fetchBalance";

export interface ArinaxState {
	textMode: boolean;
	wallets: SerializedWallet[];
	wallet: SerializedWallet | null;

	// select wallet automatically
	auto: boolean;

	transaction: string | null;
	details: boolean;

	progress: number;

	fetching: boolean;
	uploading: boolean;

	cost: string | null;
	estimating: boolean;
	estimateError: string | null;

	minting: boolean;
	minted: string | null;

	uploadError: string | null;
	fetchError: string | null;
	mintError: string | null;
}

const initialState: ArinaxState = {
	textMode: false,
	wallets: [],
	wallet: null,

	auto: true,

	transaction: null,
	details: true,
	progress: 0,

	fetching: false,
	uploading: false,
	minting: false,
	minted: null,

	cost: null,
	estimating:false,
	estimateError:null,

	uploadError: null,
	fetchError: null,
	mintError: null,
};

const arinaxSlice = createSlice({
	name: "arinax",
	initialState,
	reducers: {
		reset: ()=> initialState,

		setTransaction: (state, action)=>{
			state.transaction = action.payload
		},
		setWallet: (state, action)=>{
			state.wallet = action.payload
		},
		setAuto: (state, action)=>{
			state.auto = action.payload
		},
		setProgress: (state, action)=>{
			state.progress = action.payload
		},
		setDetails: (state, action)=>{
			state.details = action.payload
		},
		setTextMode: (state, action)=>{
			state.textMode = action.payload
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<ArinaxState>) => {
		builder
			.addCase(fetchWallets.pending, (state) => {
				state.fetching = true;
				state.wallets = [];
				state.wallet = null;
				state.fetchError = null;
			})
			.addCase(fetchWallets.fulfilled, (state, action:PayloadAction<SerializedWallet[]>) => {
				state.fetching = false;
				state.wallets = action.payload;
			})
			.addCase(fetchWallets.rejected, (state, action) => {
				state.fetching = false;
				state.wallets = [];
				state.wallet = null;
				state.fetchError = action.payload as string;
			})

			.addCase(uploadFile.pending, (state) => {
				state.uploading = true;
				state.transaction = null;
				state.uploadError = null;
				state.progress = 0;
			})
			.addCase(uploadFile.fulfilled, (state, action:PayloadAction<string>) => {
				state.uploading = false;
				state.transaction = action.payload;
				state.progress = 0;
				state.wallet = null
			})
			.addCase(uploadFile.rejected, (state, action) => {
				state.uploading = false;
				state.transaction = null;
				state.uploadError = action.payload as string;
				state.progress = 0;
			})

			.addCase(mintNFT.pending, (state) => {
				state.minting = true;
				state.minted = null;
				state.mintError = null;
			})
			.addCase(mintNFT.fulfilled, (state, action:PayloadAction<string>) => {
				state.minting = false;
				// state.minted = action.payload;
				state.minted = state.transaction;
			})
			.addCase(mintNFT.rejected, (state, action) => {
				state.minting = false;
				state.minted = null;
				state.mintError = action.payload as string;
			})


			.addCase(estimateCost.pending, (state) => {
				state.estimating = true;
				state.estimateError = null;
				state.cost = null;
			})
			.addCase(estimateCost.fulfilled, (state, action:PayloadAction<string>) => {
				state.estimating = false;
				state.estimateError = null;
				state.cost = action.payload;
			})
			.addCase(estimateCost.rejected, (state, action) => {
				state.estimating = false;
				state.estimateError = action.payload as string;
				state.cost = null;
			})


			.addCase(fetchBalance.pending, (state, {meta: {arg}}) => {
				state.wallets = state.wallets.map((wallet) => {
					if (wallet.id === arg.id) {
						return { ...wallet, balance: 'loading...' };
					}
					return wallet;
				});
			})

			.addCase(fetchBalance.fulfilled, (state, {meta: {arg}, payload}) => {
				state.wallets = state.wallets.map((wallet)=>{
					if(wallet.id === arg.id){
						return { ...wallet, balance: payload };
					}
					return wallet;
				})
			})
			.addCase(fetchBalance.rejected, (state, {meta: {arg}}) => {
				state.wallets = state.wallets.map((wallet) => {
					if (wallet.id === arg.id) {
						return { ...wallet, balance: 'N/A' };
					}
					return wallet;
				});
			})

	}
});

export const { reset, setWallet, setAuto, setProgress, setDetails, setTransaction, setTextMode } = arinaxSlice.actions;

export default arinaxSlice.reducer;
