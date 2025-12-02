import { AlexandrianToken } from "../types";
import { TokenBalance } from "../api/fetchBalances";

// Sort tokens by balance (alex or lbry)
export const sortTokensByBalance = (
	tokens: Record<string, AlexandrianToken>,
	balances: Record<string, TokenBalance>,
	sortBy: 'alex' | 'lbry',
	sortOrder: 'newest' | 'oldest'
): Record<string, AlexandrianToken> => {
	// Convert to array for sorting
	const tokenEntries = Object.entries(tokens);

	tokenEntries.sort(([, tokenA], [, tokenB]) => {
		const balanceA = balances[tokenA.id];
		const balanceB = balances[tokenB.id];

		const valueA = sortBy === 'alex' ? (balanceA?.alex || 0) : (balanceA?.lbry || 0);
		const valueB = sortBy === 'alex' ? (balanceB?.alex || 0) : (balanceB?.lbry || 0);

		// Apply sort order (newest = highest first, oldest = lowest first)
		return sortOrder === 'newest' ? valueB - valueA : valueA - valueB;
	});

	// Convert back to object, maintaining the sorted order
	return Object.fromEntries(tokenEntries);
};