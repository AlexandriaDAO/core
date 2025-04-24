import {
	createSlice,
	PayloadAction,
	ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import getMyTokens from "./thunks/getMyTokens";
import { toast } from "sonner";
import { NftsState } from "./types";
import listNft from "./thunks/listNft";

const initialState: NftsState = {
	ids: [],

	listing: false,
	listingError: null,

	loading: false,
	error: null,
};

const nftsSlice = createSlice({
	name: "imporium/nfts",
	initialState,
	reducers: {
		setListing(state, action: PayloadAction<boolean>) {
			state.listing = action.payload;
		},
		setListingError(state, action: PayloadAction<string | null>) {
			state.listingError = action.payload;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<NftsState>) => {
		builder
			.addCase(getMyTokens.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(getMyTokens.fulfilled, (state, action) => {
				state.ids = action.payload;
				state.loading = false;
				state.error = null;
			})
			.addCase(getMyTokens.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
				toast.error("Error while fetching tokens");
			})

			.addCase(listNft.pending, (state) => {
				state.listing = true;
				state.listingError = null;
			})
			.addCase(listNft.fulfilled, (state, action) => {
				state.ids = state.ids.filter((id) => id !== action.meta.arg.id);

				state.listing = false;
				state.listingError = null;
			})
			.addCase(listNft.rejected, (state, action) => {
				state.listing = false;
				state.listingError = action.payload as string;
				toast.error("Error while listing NFT");
			});
	},
});

export const { setLoading, setError, setListing, setListingError } = nftsSlice.actions;

export default nftsSlice.reducer;