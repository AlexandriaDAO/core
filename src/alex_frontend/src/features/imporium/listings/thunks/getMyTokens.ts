import { Principal } from "@dfinity/principal";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { createTokenAdapter } from "@/apps/Modules/shared/adapters/TokenAdapter";
import { RootState } from "@/store";
import { natToArweaveId } from "@/utils/id_convert";

// get my icrc7 tokens
const getMyTokens = createAsyncThunk<
	string[], // Return structure
	void, // Argument type
	{ rejectValue: string; state: RootState }
>(
	"imporium/myNfts/getMyTokens",
	async (_, { rejectWithValue, getState }) => {
		try {
			const { user } = getState().auth

			if (!user) {
				return rejectWithValue("User not authenticated");
			}

			const adapter = createTokenAdapter("NFT");

			// Fetch the user's tokens using the adapter
			const tokens = await adapter.getTokensOf(Principal.fromText(user.principal));

			// Convert tokens to arweave ids
			return tokens.map(tokenId => natToArweaveId(tokenId))
		} catch (error) {
			console.error("Error fetching tokens:", error);
			return rejectWithValue(
				"An unknown error occurred while fetching tokens"
			);
		}
	}
);
export default getMyTokens;
