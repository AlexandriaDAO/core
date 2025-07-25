import { AlexandrianToken } from "../types";
import { TokenAdapter } from "../adapters/TokenAdapter";

// Convert raw token IDs to full AlexandrianToken objects
export const convertTokenData = async (
	tokenIds: bigint[],
	tokenAdapter: TokenAdapter,
	principalId: string,
	collectionType: 'NFT' | 'SBT',
	ownedTokenIds: Set<string>,
	signal?: AbortSignal
): Promise<Record<string, AlexandrianToken>> => {
	const tokens: Record<string, AlexandrianToken> = {};
	const batchSize = 10; // Process 10 tokens at a time to allow cancellation

	// Process tokens in small batches so we can check for cancellation regularly
	for (let i = 0; i < tokenIds.length; i += batchSize) {
		// Check if the request was cancelled
		if (signal?.aborted) {
			throw new Error('Request cancelled');
		}

		const batch = tokenIds.slice(i, i + batchSize);

		// Process this batch of tokens in parallel
		const batchPromises = batch.map(async (tokenId) => {
			const tokenData = await convertSingleToken(
				tokenId,
				tokenAdapter,
				principalId,
				collectionType,
				ownedTokenIds
			);
			return tokenData;
		});

		const batchResults = await Promise.all(batchPromises);

		// Add the results to our tokens object
		batchResults.forEach((tokenData) => {
			if (tokenData) {
				tokens[tokenData.id] = tokenData;
			}
		});
	}

	return tokens;
};

// Convert a single token ID to AlexandrianToken
const convertSingleToken = async (
	tokenId: bigint,
	tokenAdapter: TokenAdapter,
	principalId: string,
	collectionType: 'NFT' | 'SBT',
	ownedTokenIds: Set<string>
): Promise<AlexandrianToken | null> => {
	try {
		let ownerPrincipal = principalId;

		// If we're browsing all tokens (principalId = "all"), we need to find the actual owner
		if (principalId === "all") {
			const ownerResult = await tokenAdapter.getOwnerOf([tokenId]);
			if (ownerResult?.[0]?.[0]?.owner) {
				ownerPrincipal = ownerResult[0][0].owner.toString();
			}
		}

		// Get the full token data from the adapter
		const tokenData = await tokenAdapter.tokenToNFTData(tokenId, ownerPrincipal);

		return {
			id: tokenId.toString(),
			arweaveId: tokenData.arweaveId,
			owner: ownerPrincipal,
			collection: collectionType,
			canister: tokenData.canister,
			createdAt: Date.now(),
			owned: ownedTokenIds.has(tokenId.toString()),
		};
	} catch (error) {
		console.warn(`Failed to convert token ${tokenId}:`, error);
		return null; // Skip this token if conversion fails
	}
};