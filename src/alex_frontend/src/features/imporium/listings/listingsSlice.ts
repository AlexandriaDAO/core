import {
	createSlice,
	PayloadAction,
	ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { ListingsState } from "./types";
import getListings from "./thunks/getListings";
import searchById from "./thunks/searchById";
import search from "./thunks/search";
import unlist from "./thunks/unlist";
import edit from "./thunks/edit";
import purchase from "./thunks/purchase";

export const PageSizeOptions: number[] = [4, 8, 16, 48];

const initialState: ListingsState = {
	nfts: {},
	found: {},
	page: 0,
	size: PageSizeOptions[0],
	pages: null,

	sortByPrice: null,
	sortByTime: null,

	unlisting: false,
	unlistingError: null,

	purchasing: false,
	purchasingError: null,

	editing: false,
	editingError: null,

	loading: false,
	error: null,
};

const listingsSlice = createSlice({
	name: "imporium/listings",
	initialState,
	reducers: {
		setSize(state, action: PayloadAction<number>) {
			state.size = action.payload;
		},
		setPage(state, action: PayloadAction<number>) {
			state.page = action.payload;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		toggleSortByPrice(state) {
			state.sortByTime = null;
			state.sortByPrice = state.sortByPrice === null ? true : state.sortByPrice ? false : null;
		},
		toggleSortByTime(state) {
			state.sortByPrice = null;
			state.sortByTime = state.sortByTime === null ? true : state.sortByTime ? false : null;
		},
		clearFound(state) {
			state.found = {};
			state.error = null;
		},
	},
	extraReducers: (builder: ActionReducerMapBuilder<ListingsState>) => {
		builder
			.addCase(getListings.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(getListings.fulfilled, (state, action) => {
				state.nfts = action.payload.nfts;
				state.pages = action.payload.totalPages;
				state.page = action.payload.currentPage;
				state.size = action.payload.pageSize;

				state.loading = false;
				state.error = null;
			})
			.addCase(getListings.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
				toast.error("Error while fetching listings");
			})

			.addCase(searchById.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(searchById.fulfilled, (state, action) => {
				state.found = action.payload;

				state.loading = false;
				state.error = null;
			})
			.addCase(searchById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})

			.addCase(search.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(search.fulfilled, (state, action) => {
				state.found = action.payload;

				state.loading = false;
				state.error = null;
			})
			.addCase(search.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})

			.addCase(unlist.pending, (state) => {
				state.unlisting = true;
				state.unlistingError = null;
			})
			.addCase(unlist.fulfilled, (state, action) => {
				state.nfts = Object.fromEntries(
					Object.entries(state.nfts).filter(([key]) => key !== action.meta.arg.id)
				);

				state.unlisting = false;
				state.unlistingError = null;
				toast.success("NFT unlisted");
			})
			.addCase(unlist.rejected, (state, action) => {
				state.unlisting = false;
				state.unlistingError = action.payload as string;
				toast.error("Error while unlisting NFT");
			})

			.addCase(purchase.pending, (state) => {
				state.purchasing = true;
				state.purchasingError = null;
			})
			.addCase(purchase.fulfilled, (state, action) => {
				state.nfts = Object.fromEntries(
					Object.entries(state.nfts).filter(([key]) => key !== action.meta.arg.id)
				);

				state.purchasing = false;
				state.purchasingError = null;
				toast.success("NFT acquired");
			})
			.addCase(purchase.rejected, (state, action) => {
				state.purchasing = false;
				state.purchasingError = action.payload as string;
				toast.error("Error while purchasing NFT");
			})
			.addCase(edit.pending, (state) => {
				state.editing = true;
				state.editingError = null;
			})
			.addCase(edit.fulfilled, (state, action) => {
				state.nfts[action.meta.arg.id].price = action.meta.arg.price;

				state.editing = false;
				state.editingError = null;
				toast.success("NFT price updated");
			})
			.addCase(edit.rejected, (state, action) => {
				state.editing = false;
				state.editingError = action.payload as string;
				toast.error("Error while editing NFT");
			});
	},
});

export const { setSize, setPage, setLoading, setError, toggleSortByPrice, toggleSortByTime, clearFound } = listingsSlice.actions;

export default listingsSlice.reducer;