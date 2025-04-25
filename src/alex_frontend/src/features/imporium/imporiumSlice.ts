import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import nftsReducer from "./nfts/nftsSlice";
import listingsReducer from "./listings/listingsSlice";
// import marketplaceReducer from "./marketplace/marketplaceSlice";

interface ImporiumState {
	loading: boolean;
	error: string | null;
}

const initialState: ImporiumState = {
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