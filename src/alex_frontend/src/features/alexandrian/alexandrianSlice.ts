import {
	createSlice,
	PayloadAction,
} from "@reduxjs/toolkit";
import { AlexandrianState, PAGE_SIZE_OPTIONS, TokenType } from "./types";

const initialState: AlexandrianState = {
	// Filters
	selectedUser: null, // null means "Most Recent"
	collectionType: "NFT",
	sortOrder: "newest",
	safe: false,

	// Pagination
	page: 0,
	pageSize: PAGE_SIZE_OPTIONS[0],
	totalPages: 0,
	totalItems: 0,

	// Sorting
	sortBy: "default",

	// Loading states
	loading: false,
	refreshing: false,

	// Error states
	error: null,
};

const alexandrianSlice = createSlice({
	name: "alexandrian",
	initialState,
	reducers: {
		// Filter actions
		setSelectedUser: (state, action: PayloadAction<string | null>) => {
			state.selectedUser = action.payload;
			state.page = 0; // Reset to first page when user changes
		},
		setCollectionType: (state, action: PayloadAction<TokenType>) => {
			state.collectionType = action.payload;
			state.page = 0; // Reset to first page when collection changes
		},
		setSortOrder: (state, action: PayloadAction<"newest" | "oldest">) => {
			state.sortOrder = action.payload;
			state.page = 0; // Reset to first page when sort changes
		},
		setSafe: (state, action: PayloadAction<boolean>) => {
			state.safe = action.payload;
		},

		// Pagination actions
		setPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload;
		},
		setPageSize: (state, action: PayloadAction<number>) => {
			state.pageSize = action.payload;
			state.page = 0; // Reset to first page when page size changes
		},

		// Sorting actions
		setSortBy: (
			state,
			action: PayloadAction<"default" | "alex" | "lbry">
		) => {
			state.sortBy = action.payload;
			state.page = 0; // Reset to first page when sort changes
		},

		// Utility actions
		clearError: (state) => {
			state.error = null;
		},
		reset: () => initialState,
	},
});

export const {
	setSelectedUser,
	setCollectionType,
	setSortOrder,
	setSafe,
	setPage,
	setPageSize,
	setSortBy,
	clearError,
	reset,
} = alexandrianSlice.actions;

export default alexandrianSlice.reducer;
