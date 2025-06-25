import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import locked from './thunks/locked';
import price from './thunks/price';
import unlocked from './thunks/unlocked';
import rate from './thunks/rate';
import fee from './thunks/fee';
import withdraw from './thunks/withdraw';

export interface AlexBalanceState {
	locked: number;
	lockedLoading: boolean;
	lockedError: string | null;

	unlocked: number;
	unlockedLoading: boolean;
	unlockedError: string | null;

	price: number;
	priceLoading: boolean;
	priceError: string | null;

	rate: number;
	rateLoading: boolean;
	rateError: string | null;

	fee: number;
	feeLoading: boolean;
	feeError: string | null;

	withdrawing: boolean;
	withdrawError: string | null;

	lastRefresh: number | null;
}

const initialState: AlexBalanceState = {
	locked: -1,
	lockedLoading: false,
	lockedError: null,

	unlocked: -1,
	unlockedLoading: false,
	unlockedError: null,

	price: -1,
	priceLoading: false,
	priceError: null,

	rate: -1,
	rateLoading: false,
	rateError: null,

	fee: -1,
	feeLoading: false,
	feeError: null,

	withdrawing: false,
	withdrawError: null,

	lastRefresh: null,
};

const alexSlice = createSlice({
	name: "balance/alex",
	initialState,
	reducers: {
		clearUnlockedError: (state) => {
			state.unlockedError = null;
		},
		clearLockedError: (state) => {
			state.lockedError = null;
		},
		clearPriceError: (state) => {
			state.priceError = null;
		},
		clearRateError: (state) => {
			state.rateError = null;
		},
		clearFeeError: (state) => {
			state.feeError = null;
		},
		clearWithdrawError: (state) => {
			state.withdrawError = null;
		},
		clearAllErrors: (state) => {
			state.lockedError = null;
			state.unlockedError = null;
			state.priceError = null;
			state.rateError = null;
			state.feeError = null;
			state.withdrawError = null;
		},
		setLastRefresh: (state) => {
			state.lastRefresh = Date.now();
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<AlexBalanceState>) => {
		builder
			// ALEX Balance
			.addCase(unlocked.pending, (state) => {
				state.unlockedLoading = true;
				state.unlockedError = null;
			})
			.addCase(unlocked.fulfilled, (state, action) => {
				state.unlocked = action.payload;
				state.unlockedLoading = false;
				state.unlockedError = null;
				state.lastRefresh = Date.now();
			})
			.addCase(unlocked.rejected, (state, action) => {
				state.unlockedLoading = false;
				state.unlockedError = action.payload as string;
				state.unlocked = -1;
				toast.error("Failed to fetch ALEX balance");
			})

			// ALEX Locked Balance
			.addCase(locked.pending, (state) => {
				state.lockedLoading = true;
				state.lockedError = null;
			})
			.addCase(locked.fulfilled, (state, action) => {
				state.locked = action.payload;
				state.lockedLoading = false;
				state.lockedError = null;
				state.lastRefresh = Date.now();
			})
			.addCase(locked.rejected, (state, action) => {
				state.lockedLoading = false;
				state.lockedError = action.payload as string;
				state.locked = -1;
			})

			// ALEX Price
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

			// ALEX Rate (Mint Rate)
			.addCase(rate.pending, (state) => {
				state.rateLoading = true;
				state.rateError = null;
			})
			.addCase(rate.fulfilled, (state, action) => {
				state.rate = action.payload;
				state.rateLoading = false;
				state.rateError = null;
			})
			.addCase(rate.rejected, (state, action) => {
				state.rateLoading = false;
				state.rateError = action.payload || "Failed to fetch ALEX mint rate";
				state.rate = -1;
			})

			// ALEX Fee
			.addCase(fee.pending, (state) => {
				state.feeLoading = true;
				state.feeError = null;
			})
			.addCase(fee.fulfilled, (state, action) => {
				state.fee = action.payload;
				state.feeLoading = false;
				state.feeError = null;
			})
			.addCase(fee.rejected, (state, action) => {
				state.feeLoading = false;
				state.feeError = action.payload || "Failed to fetch ALEX fee";
				state.fee = -1;
			})

			// Withdraw
			.addCase(withdraw.pending, (state) => {
				state.withdrawing = true;
				state.withdrawError = null;
			})
			.addCase(withdraw.fulfilled, (state, action) => {
				state.withdrawing = false;
				state.withdrawError = null;
				toast.success("Successfully withdrew ALEX");
			})
			.addCase(withdraw.rejected, (state, action) => {
				state.withdrawing = false;
				state.withdrawError = action.payload || "Failed to withdraw";
			});
	},
});

export const { clearUnlockedError, clearLockedError, clearPriceError, clearRateError, clearFeeError, clearWithdrawError, clearAllErrors, setLastRefresh } = alexSlice.actions;
export default alexSlice.reducer;