import type { AlexandrianToken } from "./models";

export interface UseAlexandrianTokensReturn {
	tokens: Record<string, AlexandrianToken>; // Token data
	totalPages: number; // For pagination UI
	totalItems: number; // For "showing X of Y" messages
	loading: boolean; // Initial loading state
	updating: boolean; // Background updates (revalidation)
	error: string | null; // Error message if something went wrong
	refresh: () => void; // Manual refresh function
}
