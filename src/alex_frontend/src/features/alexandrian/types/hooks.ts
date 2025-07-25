import type { TokenType } from "./common";
import type { AlexandrianToken } from "./models";

// Hook interfaces
export interface UseAlexandrianTokensParams {
	collectionType: TokenType;
	user?: string | null; // null or undefined = all users
	page?: number;
	pageSize?: number;
	sortOrder?: "newest" | "oldest";
	sortBy?: "default" | "alex" | "lbry";
	currentUserPrincipal?: string; // For ownership checking
}

export interface UseAlexandrianTokensReturn {
	tokens: Record<string, AlexandrianToken>; // Token data
	totalPages: number; // For pagination UI
	totalItems: number; // For "showing X of Y" messages
	loading: boolean; // Initial loading state
	updating: boolean; // Background updates (revalidation)
	error: string | null; // Error message if something went wrong
	refresh: () => void; // Manual refresh function
	updateTokenOwnership: (tokenId: string) => void; // Optimistic update for ownership
}
