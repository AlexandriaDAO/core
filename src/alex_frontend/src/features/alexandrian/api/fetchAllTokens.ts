import { TokenIdsResult, TokenFetchParams } from "../types";
import { calculateStartPosition, calculateTakeAmount } from "../utils/calculatePagination";

// Fetch tokens from the global collection (all users)
export const fetchAllTokens = async (
	tokenAdapter: any,
	params: TokenFetchParams,
	signal?: AbortSignal
): Promise<TokenIdsResult> => {
	// Check if request was cancelled before we start
	if (signal?.aborted) {
		throw new Error('Request cancelled');
	}

	// Get total number of tokens in the collection
	const totalCount = await tokenAdapter.getTotalSupply();

	// Check cancellation after each async operation
	if (signal?.aborted) {
		throw new Error('Request cancelled');
	}

	// Calculate where to start fetching based on pagination and sort order
	const startPosition = calculateStartPosition(
		params.page,
		params.pageSize,
		totalCount,
		params.sortOrder
	);

	// Calculate how many tokens to fetch for this page
	const takeAmount = calculateTakeAmount(startPosition, params.pageSize, totalCount);

	let tokenIds: bigint[] = [];

	// Only fetch if we have tokens to fetch
	if (takeAmount > 0) {
		// Fetch the token IDs for this page
		tokenIds = await tokenAdapter.getTokens(BigInt(startPosition), BigInt(takeAmount));

		// If we're showing newest first, reverse the order
		// (The API returns oldest first by default)
		if (params.sortOrder === "newest") {
			tokenIds = tokenIds.reverse();
		}
	}

	// Final cancellation check
	if (signal?.aborted) {
		throw new Error('Request cancelled');
	}

	return {
		tokenIds,
		totalCount,
	};
};