import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { createTokenAdapter } from "@/apps/Modules/shared/adapters/TokenAdapter";
import { fetchTransactionsForAlexandrian } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { AssetItem } from "../types";
import { RootState } from "@/store";

export const fetchUserArweaveAssets = createAsyncThunk<
	AssetItem[],
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

		// Get arweave IDs for each token
		const arweaveIds: string[] = [];
		for (const tokenId of tokenIds) {
			const nftData = await nftAdapter.tokenToNFTData(
				tokenId,
				userPrincipal
			);
			arweaveIds.push(nftData.arweaveId);
		}

		// Fetch transaction data for the arweave IDs
		const transactions = await fetchTransactionsForAlexandrian(arweaveIds);

		// Map transactions to asset items
		const assets: AssetItem[] = transactions.map((tx) => {
			// Extract content type and other metadata from tags
			const contentTypeTag = tx.tags.find(
				(tag) => tag.name === "Content-Type"
			);
			const titleTag = tx.tags.find((tag) => tag.name === "Title");
			const descriptionTag = tx.tags.find(
				(tag) => tag.name === "Description"
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
