import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import fetchUsers from "./thunks/fetchUsers";

export interface NFTUser {
	principal: string;
	username: string;
	hasNfts: boolean;
	hasSbts: boolean;
}

interface NFTState {
	users: NFTUser[];
	loading: boolean;
	error: string | null;
}

const initialState: NFTState = {
	users: [],
	loading: false,
	error: null,
};

const nftSlice = createSlice({
	name: "nft",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUsers.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<NFTUser[]>) => {
				state.loading = false;
				state.users = action.payload;
				state.error = null;
			})
			.addCase(fetchUsers.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || "Failed to fetch users";
			});
	},
});

export const { clearError } = nftSlice.actions;
export default nftSlice.reducer;