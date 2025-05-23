import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import nftsReducer from "./nfts/nftsSlice";
import listingsReducer from "./listings/listingsSlice";
import { TransformedLog } from "./types";
import getUserLogs from "./thunks/getUserLog";
import { toast } from "sonner";
// import marketplaceReducer from "./marketplace/marketplaceSlice";

interface ImporiumState {
	logs: TransformedLog[];
	pageSize: number;
	totalPages: number;
	currentPage: number;

	loading: boolean;
	error: string | null;
}

const initialState: ImporiumState = {
	logs: [],
	pageSize: 0,
	totalPages: 0,
	currentPage: 0,

	loading: false,
	error: null,
};

const imporiumSlice = createSlice({
	name: "imporium",
	initialState,
	reducers: {
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
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
	}
});

export const { setLoading, setError } = imporiumSlice.actions;

// Create a custom root reducer that combines the main slice with sub-feature slices
const imporiumReducer = (state: any = {}, action: any) => {
	// First get the state from the main imporium slice
	const mainState = imporiumSlice.reducer(state, action);

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