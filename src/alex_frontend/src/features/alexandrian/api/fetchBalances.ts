import type { TokenAdapter } from "../adapters/TokenAdapter";
import type { AlexandrianToken } from "../types";

export interface TokenBalance {
	alex: number;
	lbry: number;
}

export const fetchBalances = async (
	tokens: Record<string, AlexandrianToken>,
	tokenAdapter: TokenAdapter,
	signal?: AbortSignal
): Promise<Record<string, TokenBalance>> => {
	const balances: Record<string, TokenBalance> = {};
	const batchSize = 10; // Process tokens in batches to avoid overwhelming the network

	const tokenEntries = Object.entries(tokens);

	// Process tokens in batches
	for (let i = 0; i < tokenEntries.length; i += batchSize) {
		// Check for cancellation
		if (signal?.aborted) {
			throw new Error("Request cancelled");
		}

		const batch = tokenEntries.slice(i, i + batchSize);

		// Process this batch in parallel
		const batchPromises = batch.map(async ([tokenId, token]) => {
			try {
				const icpInfo = await tokenAdapter.tokenToIcpInfo(
					BigInt(tokenId)
				);
				return {
					tokenId,
					balance: {
						alex: icpInfo.alex,
						lbry: icpInfo.lbry,
					},
				};
			} catch (error) {
				console.warn(
					`Failed to fetch balance for token ${tokenId}:`,
					error
				);
				// Return default values on error

				return {
					tokenId,
					balance: {
						alex: 0,
						lbry: 0,
					},
				};
			}
		});

		const batchResults = await Promise.all(batchPromises);

		// Add results to the balances object
		batchResults.forEach(({ tokenId, balance }) => {
			balances[tokenId] = balance;
		});
	}

	return balances;
};
