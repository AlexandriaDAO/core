import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import fetchMyWallets from "./thunks/fetchMyWallets";
import { toast } from "sonner";
import deleteWallet from "./thunks/deleteWallet";
import updateWalletStatus from "./thunks/updateWalletStatus";
import { PublicKey } from "../../../../declarations/alex_wallet/alex_wallet.did";
import fetchBalance from "./thunks/fetchBalance";

export interface SerializedWallet {
	'id' : string,
	'public' : PublicKey,
	'address' : string,
	// balance in winston
	'balance' : string,
	'active' : boolean,
	'owner' : string,
	'created_at' : string,
	'updated_at' : string,
}

// Define the interface for our node state
export interface WalletsState {
	wallets: SerializedWallet[];

	deleting: string;
	updating: string;

	loading: boolean;
	error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: WalletsState = {
    wallets: [],

	deleting: '',
	updating: '',

	loading: false,
	error: null,
};

const walletsSlice = createSlice({
	name: "wallets",
	initialState,
	reducers: {
		setDeleting: (state, action)=>{
			state.deleting = action.payload;
		},

		setUpdating: (state, action)=>{
			state.updating = action.payload;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<WalletsState>) => {
		builder
			.addCase(fetchMyWallets.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchMyWallets.fulfilled, (state, action:PayloadAction<SerializedWallet[]>) => {
				state.loading = false;
				state.error = null;
				state.wallets = action.payload;
			})
			.addCase(fetchMyWallets.rejected, (state, action) => {
				state.loading = false;
				state.wallets = [];
				state.error = action.payload as string;
			})

			.addCase(deleteWallet.pending, (state) => {
				toast.info('Deleting Wallet')
				state.error = null;
			})
			.addCase(deleteWallet.fulfilled, (state, action:PayloadAction<boolean>) => {
				toast.success('Wallet Deleted')

				if (action.payload) {
					state.wallets = state.wallets.filter((wallet) => wallet.id !== state.deleting);
				}

				state.deleting = '';
				state.error = null;
			})
			.addCase(deleteWallet.rejected, (state, action) => {
				toast.error('Wallet Could not be deleted '+ action.payload)

				state.deleting = '';
				state.error = action.payload as string;
			})

			.addCase(updateWalletStatus.pending, (state) => {
				toast.info('Updating Status')
				state.error = null;
			})
			.addCase(updateWalletStatus.fulfilled, (state, action) => {
				toast.success('Status Updated')

				state.wallets = state.wallets.map((wallet)=>{
					if(wallet.id === action.payload.id){
						return action.payload;
					}
					return wallet;
				})

				state.updating = '';
				state.error = null;
			})
			.addCase(updateWalletStatus.rejected, (state, action) => {
				toast.error('Status Could not be updated '+ action.payload)

				state.updating = '';
				state.error = action.payload as string;
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

export const {setUpdating, setDeleting} = walletsSlice.actions;

export default walletsSlice.reducer;
