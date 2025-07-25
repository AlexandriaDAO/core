import { Principal } from "@dfinity/principal";

// Check which tokens the current user owns
export const fetchTokenOwnership = async (
	tokenAdapter: any,
	currentUserPrincipal?: string,
	signal?: AbortSignal
): Promise<Set<string>> => {
	// If no user is logged in, they don't own anything
	if (!currentUserPrincipal) {
		return new Set();
	}

	// Check if request was cancelled
	if (signal?.aborted) {
		throw new Error('Request cancelled');
	}

	try {
		// Get all tokens owned by the current user
		const principal = Principal.fromText(currentUserPrincipal);
		const ownedTokens = await tokenAdapter.getTokensOf(principal);

		// Convert to a Set of string IDs for fast lookup
		return new Set(ownedTokens.map((id: bigint) => id.toString()));
	} catch (error) {
		// If ownership check fails, just log a warning and continue
		// The user experience shouldn't break just because we can't check ownership
		console.warn("Failed to check token ownership:", error);
		return new Set();
	}
};