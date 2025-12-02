import { SearchResponse, SearchParams } from "../types";
import { buildTagFilters, buildBlockFilters, checkMintedStatus } from "../utils";
import { fetchByOwner } from "./fetchByOwner";
import { fetchById } from "./fetchById";
import { fetchAll } from "./fetchAll";

export async function fetchSearchResults({ query, filters, sortOrder, cursor, actor, signal, timestamp }: SearchParams & { signal?: AbortSignal; }): Promise<SearchResponse> {
	const tags = buildTagFilters(filters);
	const range = await buildBlockFilters(timestamp, filters.include);

	// If no query, fetch all transactions
	if (!query) {
		const result = await fetchAll({ order: sortOrder, after: cursor, tags, range, signal });
		const transactionsWithMinted = await checkMintedStatus(result.transactions, actor);
		return {
			transactions: transactionsWithMinted,
			cursor: result.cursor,
			hasNext: result.hasNext,
		};
	}

	// If there's a query, fetch both by ID and by owner in parallel
	const [ownerResult, idResult] = await Promise.all([
		fetchByOwner({ query, order: sortOrder, after: cursor, tags, range, signal }),
		fetchById({ query, order: sortOrder, after: cursor, tags, range, signal })
	]);

	// Merge transactions
	const allTransactions = [...ownerResult.transactions, ...idResult.transactions];

	// Apply minted status check
	const transactionsWithMinted = await checkMintedStatus(allTransactions, actor);

	return {
		transactions: transactionsWithMinted,
		cursor: ownerResult.cursor || idResult.cursor,
		hasNext: ownerResult.hasNext || idResult.hasNext,
	};
}