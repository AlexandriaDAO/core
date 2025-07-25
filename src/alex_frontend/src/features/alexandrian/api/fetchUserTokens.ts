import { Principal } from "@dfinity/principal";
import { TokenIdsResult, TokenFetchParams } from "../types";

// Fetch tokens owned by a specific user
export const fetchUserTokens = async (
	tokenAdapter: any,
	userPrincipalId: string,
	params: TokenFetchParams,
	signal?: AbortSignal
): Promise<TokenIdsResult> => {
	if (signal?.aborted) {
		throw new Error('Request cancelled');
	}

	const principal = Principal.fromText(userPrincipalId);

	// Get total number of tokens this user owns
	const totalCount = await tokenAdapter.getBalanceOf(principal);

	if (signal?.aborted) {
		throw new Error('Request cancelled');
	}

	// Choose strategy based on collection size
	const isSmallCollection = Number(totalCount) <= 500;

	let tokenIds: bigint[];

	if (isSmallCollection) {
		// For small collections, fetch all tokens and slice locally
		tokenIds = await fetchSmallUserCollection(tokenAdapter, principal, totalCount, params, signal);
	} else {
		// For large collections, use cursor-based pagination
		tokenIds = await fetchLargeUserCollection(tokenAdapter, principal, totalCount, params, signal);
	}

	return {
		tokenIds,
		totalCount,
	};
};

// Handle small user collections (≤500 tokens) - simple and fast
const fetchSmallUserCollection = async (
	tokenAdapter: any,
	principal: Principal,
	totalCount: bigint,
	params: TokenFetchParams,
	signal?: AbortSignal
): Promise<bigint[]> => {
	// Fetch all tokens at once
	const allTokens = await tokenAdapter.getTokensOf(principal, undefined, totalCount);

	if (signal?.aborted) throw new Error('Request cancelled');

	// Sort them based on the requested order
	if (params.sortOrder === "newest") allTokens.reverse();

	// Extract the page we need
	const startIndex = params.page * params.pageSize;
	const endIndex = Math.min(startIndex + params.pageSize, allTokens.length);

	return allTokens.slice(startIndex, endIndex);
};

// Handle large user collections (>500 tokens) - cursor-based pagination
const fetchLargeUserCollection = async (
	tokenAdapter: any,
	principal: Principal,
	totalCount: bigint,
	params: TokenFetchParams,
	signal?: AbortSignal
): Promise<bigint[]> => {
	if (params.sortOrder === "newest") {
		return await fetchLargeCollectionNewest(tokenAdapter, principal, totalCount, params, signal);
	} else {
		return await fetchLargeCollectionOldest(tokenAdapter, principal, totalCount, params, signal);
	}
};

// Fetch from large collection, newest first
const fetchLargeCollectionNewest = async (
	tokenAdapter: any,
	principal: Principal,
	totalCount: bigint,
	params: TokenFetchParams,
	signal?: AbortSignal
): Promise<bigint[]> => {
	const tokensToSkip = Math.max(0, Number(totalCount) - (params.page + 1) * params.pageSize);

	if (tokensToSkip === 0) {
		// We're on the last page, just get the remaining tokens
		const remainingTokens = Number(totalCount) % params.pageSize || params.pageSize;
		let tokenIds = await tokenAdapter.getTokensOf(principal, undefined, BigInt(remainingTokens));
		return tokenIds.reverse();
	}

	// Skip tokens in batches to allow cancellation
	let position = 0;
	let lastToken: bigint | undefined;
	const batchSize = Math.min(100, tokensToSkip);

	while (position < tokensToSkip && !signal?.aborted) {
		const currentBatch = Math.min(batchSize, tokensToSkip - position);
		const batch = await tokenAdapter.getTokensOf(principal, lastToken, BigInt(currentBatch));

		if (batch.length === 0) break;

		position += batch.length;
		lastToken = batch[batch.length - 1];
	}

	if (signal?.aborted) {
		throw new Error('Request cancelled');
	}

	// Now get the actual page we want
	let tokenIds: bigint[] = [];
	if (lastToken) {
		tokenIds = await tokenAdapter.getTokensOf(principal, lastToken, BigInt(params.pageSize));
		tokenIds = tokenIds.reverse();
	}

	return tokenIds;
};

// Fetch from large collection, oldest first
const fetchLargeCollectionOldest = async (
	tokenAdapter: any,
	principal: Principal,
	totalCount: bigint,
	params: TokenFetchParams,
	signal?: AbortSignal
): Promise<bigint[]> => {
	const startIndex = params.page * params.pageSize;

	if (startIndex === 0) {
		// First page is easy
		return await tokenAdapter.getTokensOf(principal, undefined, BigInt(params.pageSize));
	}

	// Skip to the start position in batches
	let position = 0;
	let lastToken: bigint | undefined;
	const batchSize = Math.min(100, startIndex);

	while (position < startIndex && !signal?.aborted) {
		const currentBatch = Math.min(batchSize, startIndex - position);
		const batch = await tokenAdapter.getTokensOf(principal, lastToken, BigInt(currentBatch));

		if (batch.length === 0) break;

		position += batch.length;
		lastToken = batch[batch.length - 1];
	}

	if (signal?.aborted) {
		throw new Error('Request cancelled');
	}

	// Get the actual page
	return lastToken
		? await tokenAdapter.getTokensOf(principal, lastToken, BigInt(params.pageSize))
		: await tokenAdapter.getTokensOf(principal, undefined, BigInt(params.pageSize));
};