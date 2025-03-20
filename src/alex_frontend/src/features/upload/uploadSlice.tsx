import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import fetchWallets from "./thunks/fetchWallets";
import uploadFile from "./thunks/uploadFile";
import mintNFT from "./thunks/mintNFT";
import estimateCost from "./thunks/estimateCost";
import { SerializedWallet } from "../wallets/walletsSlice";
import fetchBalance from "./thunks/fetchBalance";
import selectWallet from "./thunks/selectWallet";
import getSpendingBalance from "../swap/thunks/lbryIcrc/getSpendingBalance";

export enum Step {
	Select = 1,
	Preview = 2,
	Success = 3,
}

export enum ContentType {
	Local = 'local',
	Manual = 'manual'
}
export interface UploadState {
	step: Step;
	type: ContentType;
	wallets: SerializedWallet[];
	wallet: SerializedWallet | null;

	transaction: string | null;
	fileSelector: boolean;
	textEditor: boolean;
	preUploadPreview: boolean;
	postUploadPreview: boolean;

	progress: number;

	scanning: boolean;
	fetching: boolean;
	selecting: boolean;
	uploading: boolean;

	cost: string | null;
	estimating: boolean;
	estimateError: string | null;

	minting: boolean;
	minted: string | null;

	// Properties for LBRY payment
	lbryFee: number | null;
	paymentStatus: 'idle' | 'pending' | 'success' | 'failed';
	paymentError: string | null;

	uploadError: string | null;
	fetchError: string | null;
	selectError: string | null;
	mintError: string | null;
	scanError: string | null;
}

const initialState: UploadState = {
	step: Step.Select,
	type: ContentType.Local,
	wallets: [],
	wallet: null,

	transaction: null,
	fileSelector: true,
	textEditor: false,
	preUploadPreview: false,
	postUploadPreview: false,
	progress: 0,

	scanning: false,
	fetching: false,
	uploading: false,
	selecting: false,
	minting: false,
	minted: null,

	cost: null,
	estimating:false,
	estimateError:null,

	// Initialize payment properties
	lbryFee: null,
	paymentStatus: 'idle',
	paymentError: null,

	uploadError: null,
	fetchError: null,
	selectError: null,
	mintError: null,
	scanError: null,
};

const uploadSlice = createSlice({
	name: "upload",
	initialState,
	reducers: {
		reset: ()=> initialState,

		setTransaction: (state, action)=>{
			state.transaction = action.payload
		},
		setWallet: (state, action)=>{
			state.wallet = action.payload
		},
		setProgress: (state, action)=>{
			state.progress = action.payload
		},
		setFileSelector: (state, action)=>{
			state.fileSelector = action.payload
		},
		setTextEditor: (state, action)=>{
			state.textEditor = action.payload
		},
		setPreUploadPreview: (state, action)=>{
			state.preUploadPreview = action.payload
		},
		setPostUploadPreview: (state, action)=>{
			state.postUploadPreview = action.payload
		},
		setContentType: (state, action)=>{
			state.type = action.payload
		},
		setStep: (state, action)=>{
			state.step = action.payload
		},
		setScanning: (state, action)=>{
			state.scanning = action.payload
		},
		setScanError: (state, action)=>{
			state.scanError = action.payload
		},
		// Action creators for LBRY payment
		setLbryFee: (state, action)=>{
			state.lbryFee = action.payload
		},
		setPaymentStatus: (state, action)=>{
			state.paymentStatus = action.payload
		},
		setPaymentError: (state, action)=>{
			state.paymentError = action.payload
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<UploadState>) => {
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
				// state.progress = 0;
				state.wallet = null
			})
			.addCase(uploadFile.rejected, (state, action) => {
				state.uploading = false;
				state.transaction = null;
				state.uploadError = action.payload as string;
				// state.progress = 0;
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

			.addCase(selectWallet.pending, (state) => {
				state.selecting = true;
				state.selectError = null;
				state.wallet = null;
			})
			.addCase(selectWallet.fulfilled, (state, action:PayloadAction<SerializedWallet>) => {
				state.selecting = false;
				state.selectError = null;
				state.wallet = action.payload;
			})
			.addCase(selectWallet.rejected, (state, action) => {
				state.selecting = false;
				state.selectError = action.payload as string;
				state.wallet = null;
			})
			
			// Reset payment status when user gets their spending balance
			.addCase(getSpendingBalance.fulfilled, (state) => {
				// Only reset if payment hasn't already been processed
				if (state.paymentStatus !== 'success') {
					state.paymentStatus = 'idle';
					state.paymentError = null;
				}
			})
	}
});

export const { 
	reset, 
	setWallet, 
	setProgress, 
	setFileSelector, 
	setTextEditor, 
	setPreUploadPreview, 
	setPostUploadPreview, 
	setTransaction, 
	setContentType, 
	setStep, 
	setScanning, 
	setScanError,
	setLbryFee,
	setPaymentStatus,
	setPaymentError
} = uploadSlice.actions;

export default uploadSlice.reducer;
