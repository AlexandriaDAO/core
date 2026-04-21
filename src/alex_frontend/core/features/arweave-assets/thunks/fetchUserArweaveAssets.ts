import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { natToArweaveId } from "@/utils/id_convert";
import { fetchTransactionsByIds } from "../api/fetchTransactions";
import { ArweaveAssetItem } from "../types";
import { RootState } from "@/store";

export const fetchUserArweaveAssets = createAsyncThunk<
	ArweaveAssetItem[],
	void,
	{ state: RootState; rejectValue: string }
>("assets/fetchUserAssets", async (_, { getState, rejectWithValue }) => {
	try {
		const auth = getState().auth;
		const userPrincipal = auth.user?.principal;

		if (!userPrincipal) {
			return rejectWithValue("User not authenticated");
		}

		// Create NFT token adapter to get user's tokens
		const nftAdapter = createTokenAdapter("NFT");

		// Fetch user's NFTs using the adapter
		const tokenIds = await nftAdapter.getTokensOf(
			Principal.fromText(userPrincipal),
			undefined,
			BigInt(10000)
		);

		// Convert token IDs to arweave IDs
		const arweaveIds = tokenIds.map((tokenId) => natToArweaveId(tokenId));

		// Fetch transaction data for the arweave IDs
		const transactions = await fetchTransactionsByIds(arweaveIds);

		// Map transactions to asset items
		const assets: ArweaveAssetItem[] = transactions.map((tx) => {
			// Extract content type and other metadata from tags
			const contentTypeTag = tx.tags.find(
				(tag) => tag.name === "Content-Type"
			);

			return {
				id: tx.id,
				url: `https://arweave.net/${tx.id}`,
				contentType: contentTypeTag?.value,
				size: tx.data?.size,
				owner: tx.owner,
				timestamp: tx.block?.timestamp,
				tags: tx.tags,
			};
		});

		return assets;
	} catch (error) {
		console.error("Error fetching user assets:", error);
		return rejectWithValue(
			error instanceof Error ? error.message : "Unknown error occurred"
		);
	}
});
