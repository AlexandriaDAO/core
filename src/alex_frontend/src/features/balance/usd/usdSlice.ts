import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import amount from './thunks/amount';
import swap from './thunks/swap';
import session from './thunks/session';

export interface UsdBalanceState {
	amount: number;
	amountLoading: boolean;
	amountError: string | null;

	swapping: boolean;
	swapError: string | null;

	sessionLoading: boolean;
	sessionError: string | null;
}

const initialState: UsdBalanceState = {
	amount: -1,
	amountLoading: false,
	amountError: null,

	swapping: false,
	swapError: null,

	sessionLoading: false,
	sessionError: null,
};

const usdSlice = createSlice({
	name: "balance/usd",
	initialState,
	reducers: {
		clearAmountError: (state) => {
			state.amountError = null;
		},
		clearSwapError: (state) => {
			state.swapError = null;
		},
		clearSessionError: (state) => {
			state.sessionError = null;
		},
		clearAllErrors: (state) => {
			state.amountError = null;
			state.swapError = null;
			state.sessionError = null;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<UsdBalanceState>) => {
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
			})
			.addCase(amount.rejected, (state, action) => {
				state.amountLoading = false;
				state.amountError = action.payload as string;
				state.amount = -1;
				console.log('error', action.payload)
				toast.error("Failed to fetch USD balance");
			})

			// Swap
			.addCase(swap.pending, (state) => {
				state.swapping = true;
				state.swapError = null;
			})
			.addCase(swap.fulfilled, (state, action) => {
				state.swapping = false;
				state.swapError = null;
				toast.success("Successfully withdrew ICP");
			})
			.addCase(swap.rejected, (state, action) => {
				state.swapping = false;
				state.swapError = action.payload || "Failed to swap";
			})

			// Session
			.addCase(session.pending, (state) => {
				state.sessionLoading = true;
				state.sessionError = null;
			})
			.addCase(session.fulfilled, (state, action) => {
				state.sessionLoading = false;
				state.sessionError = null;
				toast.success("Payment session created successfully");
			})
			.addCase(session.rejected, (state, action) => {
				state.sessionLoading = false;
				state.sessionError = action.payload || "Failed to create payment session";
				toast.error("Failed to create payment session");
			});
	},
});

export const { clearAmountError, clearSwapError, clearSessionError, clearAllErrors, } = usdSlice.actions;
export default usdSlice.reducer;