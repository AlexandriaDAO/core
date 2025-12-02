import { createAsyncThunk } from "@reduxjs/toolkit";
import { alex_backend } from "../../../../../declarations/alex_backend";
import { NFTUser } from "../slice";

const fetchUsers = createAsyncThunk<
	NFTUser[],
	void,
	{ rejectValue: string }
>("nft/fetchUsers", async (_, { rejectWithValue }) => {
	try {
		if (!alex_backend) {
			throw new Error("Actor not available");
		}

		const nftUsers = await alex_backend.get_stored_nft_users();

		const processedUsers: NFTUser[] = nftUsers.map(user => ({
			principal: user.principal.toString(),
			username: user.username,
			hasNfts: user.has_nfts,
			hasSbts: user.has_scion_nfts,
		}));

		return processedUsers;
	} catch (error) {
		console.error("Error fetching users:", error);
		return rejectWithValue(
			error instanceof Error ? error.message : "Failed to fetch users"
		);
	}
});

export default fetchUsers;