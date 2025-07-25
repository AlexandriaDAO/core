import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import nftsReducer from "./nfts/nftsSlice";
import listingsReducer from "./listings/listingsSlice";
import { TransformedLog } from "./types";
import getUserLogs from "./thunks/getUserLog";
import getMarketLogs from "./thunks/getMarketLogs";
import { toast } from "sonner";
// import marketplaceReducer from "./marketplace/marketplaceSlice";

interface ImporiumState {
	logs: TransformedLog[];
	pageSize: number;
	totalPages: number;
	currentPage: number;

	safe: boolean;
	loading: boolean;
	error: string | null;
}

const initialState: ImporiumState = {
	logs: [],
	pageSize: 0,
	totalPages: 0,
	currentPage: 0,

	safe: true,
	loading: false,
	error: null,
};

const imporiumSlice = createSlice({
	name: "imporium",
	initialState,
	reducers: {
		setSafe: (state, action: PayloadAction<boolean>) => {
			state.safe = action.payload;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		reset: () => initialState,
	},
	extraReducers: (builder: ActionReducerMapBuilder<ImporiumState>)=>{
		builder
			.addCase(getUserLogs.pending, (state) => {
				state.logs = [];
				state.loading = true;
				state.error = null;
			})
			.addCase(getUserLogs.fulfilled, (state, action) => {
				state.logs = action.payload.logs;
				state.pageSize = action.payload.pageSize;
				state.totalPages = action.payload.totalPages;
				state.currentPage = action.payload.currentPage;

				state.loading = false;
				state.error = null;
			})
			.addCase(getUserLogs.rejected, (state, action) => {
				state.logs = []
				state.loading = false;
				state.error = action.payload as string;
				toast.error(action.payload);
			})

			.addCase(getMarketLogs.pending, (state) => {
				state.logs = [];
				state.loading = true;
				state.error = null;
			})
			.addCase(getMarketLogs.fulfilled, (state, action) => {
				state.logs = action.payload.logs;
				state.pageSize = action.payload.pageSize;
				state.totalPages = action.payload.totalPages;
				state.currentPage = action.payload.currentPage;

				state.loading = false;
				state.error = null;
			})
			.addCase(getMarketLogs.rejected, (state, action) => {
				state.logs = []
				state.loading = false;
				state.error = action.payload as string;
				toast.error(action.payload);
			})
	}
});

export const { setSafe, setLoading, setError, reset } = imporiumSlice.actions;

// Create a custom root reducer that combines the main slice with sub-feature slices
const imporiumReducer = (state: any = {}, action: any) => {
	// Check if this is the initial empty state
	const isInitialState = Object.keys(state).length === 0;

	// Extract the main state properties (excluding nested reducers)
	const { nfts, listings, ...mainStateProps } = state;

	// For initial state, pass undefined to get proper initial values
	// Otherwise, pass the current main state props
	const mainState = imporiumSlice.reducer(
		isInitialState ? undefined : mainStateProps, 
		action
	);

	// Then get states from the sub-slices
	const nftsState = nftsReducer(state?.nfts, action);
	const listingsState = listingsReducer(state?.listings, action);
	// const marketplaceState = marketplaceReducer(state?.marketplace, action);

	// Return combined state with main properties at root level
	return {
		...mainState,
		nfts: nftsState,
		listings: listingsState,
		// marketplace: marketplaceState,
	};
};

export default imporiumReducer;