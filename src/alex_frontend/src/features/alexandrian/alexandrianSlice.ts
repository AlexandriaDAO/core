import {
	createSlice,
	PayloadAction,
	ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { AlexandrianState, PAGE_SIZE_OPTIONS, TokenType } from "./types";
import fetchUsers from "./thunks/fetchUsers";

const initialState: AlexandrianState = {
	// Data
	users: [],

	// Filters
	selectedUser: null, // null means "Most Recent"
	collectionType: "NFT",
	sortOrder: "newest",
	safe: true,

	// Pagination
	page: 0,
	pageSize: PAGE_SIZE_OPTIONS[0],
	totalPages: 0,
	totalItems: 0,

	// Sorting
	sortBy: "default",

	// Loading states
	loading: false,
	loadingUsers: false,
	refreshing: false,

	// Error states
	error: null,
	userError: null,
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
			state.userError = null;
		},
		reset: () => initialState,
	},
	extraReducers: (builder: ActionReducerMapBuilder<AlexandrianState>) => {
		builder
			// Fetch Users
			.addCase(fetchUsers.pending, (state) => {
				state.loadingUsers = true;
				state.userError = null;
			})
			.addCase(fetchUsers.fulfilled, (state, action) => {
				state.users = action.payload;
				state.loadingUsers = false;
				state.userError = null;
			})
			.addCase(fetchUsers.rejected, (state, action) => {
				state.loadingUsers = false;
				state.userError = action.payload as string;
				toast.error("Failed to fetch users");
			});
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
