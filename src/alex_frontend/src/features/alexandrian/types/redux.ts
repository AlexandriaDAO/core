import type { TokenType } from './common';
import type { AlexandrianUser } from './models';

export interface AlexandrianState {
	// Data - unified tokens for current collection
	users: AlexandrianUser[];

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
	loadingUsers: boolean;
	refreshing: boolean;

	// Error states
	error: string | null;
	userError: string | null;
}