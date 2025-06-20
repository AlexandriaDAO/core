import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import amount from './thunks/amount';
import price from './thunks/price';

export interface IcpBalanceState {
	amount: number;
	amountLoading: boolean;
	amountError: string | null;

	price: number;
	priceLoading: boolean;
	priceError: string | null;

	lastRefresh: number | null;
}

const initialState: IcpBalanceState = {
	amount: -1,
	amountLoading: false,
	amountError: null,

	price: -1,
	priceLoading: false,
	priceError: null,

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
		clearAllErrors: (state) => {
			state.amountError = null;
			state.priceError = null;
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
			});
	},
});

export const { clearAmountError, clearPriceError, clearAllErrors, setLastRefresh } = icpSlice.actions;
export default icpSlice.reducer;