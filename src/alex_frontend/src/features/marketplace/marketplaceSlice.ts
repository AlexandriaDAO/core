import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { PAGE_SIZE_OPTIONS } from "./types";

export interface MarketplaceState {
	editing: string; // arweave_id, empty string for no selection
	unlisting: string; // arweave_id, empty string for no selection
	purchasing: string; // arweave_id, empty string for no selection

	safe: boolean;

	// Filter state
	selectedUser?: Principal;
	searchTerm?: string;

	// Sort state
	sortBy: "Price" | "Time";
	sortOrder: "Asc" | "Desc";

	// Pagination state
	page: number;
	pageSize: number;
}

const initialState: MarketplaceState = {
	editing: '',
	unlisting: '',
	purchasing: '',
	safe: true,
	selectedUser: undefined,
	searchTerm: undefined,
	sortBy: "Time",
	sortOrder: "Desc", // Newest first by default
	page: 1,
	pageSize: PAGE_SIZE_OPTIONS[0],
};

const marketplaceSlice = createSlice({
	name: "imporium/marketplace",
	initialState,
	reducers: {
		setEditing: (state, action: PayloadAction<string>) => {
			state.editing = action.payload;
		},
		setUnlisting: (state, action: PayloadAction<string>) => {
			state.unlisting = action.payload;
		},
		setPurchasing: (state, action: PayloadAction<string>) => {
			state.purchasing = action.payload;
		},
		setSafe: (state, action: PayloadAction<boolean>) => {
			state.safe = action.payload;
		},

		// Filter actions
		setSelectedUser: (
			state,
			action: PayloadAction<Principal | undefined>
		) => {
			state.selectedUser = action.payload;
			state.page = 1; // Reset to first page when changing user
		},
		setSearchTerm: (state, action: PayloadAction<string | undefined>) => {
			state.searchTerm = action.payload;
			state.page = 1; // Reset to first page when searching
		},

		// Sort actions
		setSortBy: (state, action: PayloadAction<"Price" | "Time">) => {
			state.sortBy = action.payload;
			state.page = 1; // Reset to first page when changing sort
		},
		setSortOrder: (state, action: PayloadAction<"Asc" | "Desc">) => {
			state.sortOrder = action.payload;
			state.page = 1; // Reset to first page when changing sort order
		},

		// Pagination actions
		setPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload;
		},
		setPageSize: (state, action: PayloadAction<number>) => {
			state.pageSize = action.payload;
			state.page = 1; // Reset to first page when changing page size
		},

		// Clear filters
		clearFilters: (state) => {
			state.selectedUser = undefined;
			state.searchTerm = undefined;
			state.page = 1;
		},

		// Reset to initial state
		reset: () => initialState,
	},
});

export const {
	setEditing,
	setUnlisting,
	setPurchasing,
	setSafe,
	setSelectedUser,
	setSearchTerm,
	setSortBy,
	setSortOrder,
	setPage,
	setPageSize,
	clearFilters,
	reset,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;
