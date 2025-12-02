import { createTokenAdapter } from "../adapters/TokenAdapter";
import { TokenFetchParams, TokenFetchResult } from "../types";
import { fetchAllTokens } from "./fetchAllTokens";
import { fetchUserTokens } from "./fetchUserTokens";
import { convertTokenData } from "../utils/convertTokenData";
import { sortTokensByBalance } from "../utils/sortTokens";
import { fetchBalances } from "./fetchBalances";
import { calculatePagination } from "../utils/calculatePagination";

// Create the main fetcher function with type-safe parameters
export const createTokenFetcher = () => {
	return async (params: TokenFetchParams, signal?: AbortSignal): Promise<TokenFetchResult> => {

		// Check for cancellation right away
		if (signal?.aborted) {
			throw new Error('Request cancelled');
		}

		// Create the token adapter for this collection type
		const tokenAdapter = createTokenAdapter(params.collectionType);

		// Step 1: Fetch token IDs based on whether we're browsing all tokens or user-specific tokens
		let tokenIds: bigint[];
		let totalCount: bigint;

		if (params.user === null) {
			// Browsing all tokens from all users
			const result = await fetchAllTokens(tokenAdapter, params, signal);
			tokenIds = result.tokenIds;
			totalCount = result.totalCount;
		} else {
			// Browsing tokens from a specific user
			const result = await fetchUserTokens(tokenAdapter, params.user, params, signal);
			tokenIds = result.tokenIds;
			totalCount = result.totalCount;
		}

		// Step 2: Convert token IDs to full token data
		const tokens = await convertTokenData(
			tokenIds,
			tokenAdapter,
			params.user || "all",
			params.collectionType,
			signal
		);

		// Step 3: Apply custom sorting if requested
		let sortedTokens = tokens;

		if (params.sortBy === 'alex' || params.sortBy === 'lbry') {

			// For balance-based sorting, we need to fetch balances first
			const balances = await fetchBalances(tokens, tokenAdapter, signal);

			// Check for cancellation after balance fetching
			if (signal?.aborted) throw new Error('Request cancelled');

			sortedTokens = sortTokensByBalance(tokens, balances, params.sortBy, params.sortOrder);
		}
		// For 'default' sorting, tokens are already sorted by the API, so no action needed


		// Step 4: Calculate pagination info
		const { totalItems, totalPages } = calculatePagination(totalCount, params.pageSize);

		// Final cancellation check
		if (signal?.aborted) {
			throw new Error('Request cancelled');
		}

		return {
			tokens: sortedTokens,
			totalPages,
			totalItems,
			page: params.page,
			pageSize: params.pageSize,
		};
	};
};