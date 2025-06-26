import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import amount from './thunks/amount';
import price from '../../icp-ledger/thunks/getIcpPrice';
import archived from './thunks/archived';
import redeem from './thunks/redeem';
import withdraw from './thunks/withdraw';

export interface IcpBalanceState {
	amount: number;
	amountLoading: boolean;
	amountError: string | null;

	price: number;
	priceLoading: boolean;
	priceError: string | null;

	archived: number;
	archiveLoading: boolean;
	archiveError: string | null;

	redeeming: boolean;
	redeemError: string | null;

	withdrawing: boolean;
	withdrawError: string | null;

	lastRefresh: number | null;
}

const initialState: IcpBalanceState = {
	amount: -1,
	amountLoading: false,
	amountError: null,

	price: -1,
	priceLoading: false,
	priceError: null,

	archived: -1,
	archiveLoading: false,
	archiveError: null,

	redeeming: false,
	redeemError: null,

	withdrawing: false,
	withdrawError: null,

	lastRefresh: null,
};

const icpSlice = createSlice({
	name: "balance/icp",
	initialState,
	reducers: {
		clearAmountError: (state) => {
			state.amountError = null;
		},
		clearPriceError: (state) => {
			state.priceError = null;
		},
		clearArchiveError: (state) => {
			state.archiveError = null;
		},
		clearRedeemError: (state) => {
			state.redeemError = null;
		},
		clearWithdrawError: (state) => {
			state.withdrawError = null;
		},
		clearAllErrors: (state) => {
			state.amountError = null;
			state.priceError = null;
			state.archiveError = null;
			state.redeemError = null;
			state.withdrawError = null;
		},
		setLastRefresh: (state) => {
			state.lastRefresh = Date.now();
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<IcpBalanceState>) => {
		builder
			// ICP Balance
			.addCase(amount.pending, (state) => {
				state.amountLoading = true;
				state.amountError = null;
			})
			.addCase(amount.fulfilled, (state, action) => {
				state.amount = action.payload;
				state.amountLoading = false;
				state.amountError = null;
				state.lastRefresh = Date.now();
			})
			.addCase(amount.rejected, (state, action) => {
				state.amountLoading = false;
				state.amountError = action.payload as string;
				state.amount = -1;
				console.log('error', action.payload)
				toast.error("Failed to fetch ICP balance");
			})

			// ICP Price
			.addCase(price.pending, (state) => {
				state.priceLoading = true;
				state.priceError = null;
			})
			.addCase(price.fulfilled, (state, action) => {
				state.price = action.payload;
				state.priceLoading = false;
				state.priceError = null;
			})
			.addCase(price.rejected, (state, action) => {
				state.priceLoading = false;
				state.priceError = action.payload as string;
				state.price = -1;
			})

			// Archived Balance
			.addCase(archived.pending, (state) => {
				state.archiveLoading = true;
				state.archiveError = null;
			})
			.addCase(archived.fulfilled, (state, action) => {
				state.archived = action.payload;
				state.archiveLoading = false;
				state.archiveError = null;
				state.lastRefresh = Date.now();
			})
			.addCase(archived.rejected, (state, action) => {
				state.archiveLoading = false;
				state.archiveError = action.payload as string;
				state.archived = -1;
				toast.error("Failed to fetch archived balance");
			})

			// Redeem
			.addCase(redeem.pending, (state) => {
				state.redeeming = true;
				state.redeemError = null;
			})
			.addCase(redeem.fulfilled, (state, action) => {
				state.redeeming = false;
				state.redeemError = null;
				toast.success("Successfully redeemed archived balance");
			})
			.addCase(redeem.rejected, (state, action) => {
				state.redeeming = false;
				state.redeemError = action.payload || "Failed to redeem";
			})

			// Withdraw
			.addCase(withdraw.pending, (state) => {
				state.withdrawing = true;
				state.withdrawError = null;
			})
			.addCase(withdraw.fulfilled, (state, action) => {
				state.withdrawing = false;
				state.withdrawError = null;
				toast.success("Successfully withdrew ICP");
			})
			.addCase(withdraw.rejected, (state, action) => {
				state.withdrawing = false;
				state.withdrawError = action.payload || "Failed to withdraw";
			});
	},
});

export const { clearAmountError, clearPriceError, clearArchiveError, clearRedeemError, clearWithdrawError, clearAllErrors, setLastRefresh } = icpSlice.actions;
export default icpSlice.reducer;