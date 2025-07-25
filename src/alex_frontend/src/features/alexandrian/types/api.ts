import type { TokenType } from './common';
import type { AlexandrianToken } from './models';

export interface FetchTokensParams {
	collectionType: TokenType;
	user?: string | null;
	page?: number;
	pageSize?: number;
	sortOrder?: "newest" | "oldest";
	sortBy?: "default" | "alex" | "lbry";
}

export interface FetchTokensResponse {
	tokens: Record<string, AlexandrianToken>;
	totalPages: number;
	totalItems: number;
	page: number;
	pageSize: number;
}

// Parameters that the user passes to token fetcher
export interface TokenFetchParams {
	collectionType: 'NFT' | 'SBT';
	user: string | null;  // null means "all users"
	page: number;
	pageSize: number;
	sortOrder: 'newest' | 'oldest';
	sortBy: 'default' | 'alex' | 'lbry';
}

// What token fetcher returns
export interface TokenFetchResult {
	tokens: Record<string, AlexandrianToken>;
	totalPages: number;
	totalItems: number;
	page: number;
	pageSize: number;
}

// Internal data passed between fetcher functions
export interface TokenFetchContext {
	tokenAdapter: any;          // The adapter for NFT/SBT calls
	principalId: string;        // Either user ID or "all"
	params: TokenFetchParams;
	signal: AbortSignal;        // For cancellation
	currentUserPrincipal?: string; // For ownership checking
}

// Result from fetching token IDs (before converting to full token data)
export interface TokenIdsResult {
	tokenIds: bigint[];
	totalCount: bigint;
}