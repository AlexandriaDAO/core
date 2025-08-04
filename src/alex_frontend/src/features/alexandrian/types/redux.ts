import type { TokenType } from './common';

export interface AlexandrianState {
	// Filters
	selectedUser: string | null; // null means "Most Recent"
	collectionType: TokenType;
	sortOrder: "newest" | "oldest";
	safe: boolean;

	// Pagination
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;

	// Sorting
	sortBy: "default" | "alex" | "lbry";

	// Loading states
	loading: boolean;
	refreshing: boolean;

	// Error states
	error: string | null;
}