import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import locked from './thunks/locked';
import price from './thunks/price';
import unlocked from './thunks/unlocked';

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
		clearAllErrors: (state) => {
			state.lockedError = null;
			state.unlockedError = null;
			state.priceError = null;
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
			});
	},
});

export const { clearUnlockedError, clearLockedError, clearPriceError, clearAllErrors, setLastRefresh } = alexSlice.actions;
export default alexSlice.reducer;