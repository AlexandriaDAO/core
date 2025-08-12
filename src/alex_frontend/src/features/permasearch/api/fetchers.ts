// import { SearchResponse, SearchParams } from "../types";
// import { fetchByQuery } from "./query-fetcher";
// import { fetchByFilters } from "./filter-fetcher";

// export async function fetchSearchResults({
// 	query,
// 	filters,
// 	sortOrder,
// 	cursor,
// 	actor,
// 	signal,
// }: SearchParams & {
// 	signal?: AbortSignal;
// }): Promise<SearchResponse> {
// 	if (query) {
// 		return fetchByQuery({ query, sortOrder, cursor, actor, signal });
// 	} else {
// 		return fetchByFilters({ filters, sortOrder, cursor, actor, signal });
// 	}
// }





import { SearchResponse, SearchParams, GraphQLQueryResponse, Transaction } from "../types";
import { ARWEAVE_GRAPHQL_ENDPOINT, buildBlockRange, buildTagFilters, checkMintedStatus, filterAvailableAssets } from "./utils";
import { getBlockHeightForTimestamp, dateStringToTimestamp } from "../utils";

export async function fetchSearchResults({ query, filters, sortOrder, cursor, actor, signal, randomDate }: SearchParams & { signal?: AbortSignal; }): Promise<SearchResponse> {
	const tags = buildTagFilters(filters);


	// // Determine which block range to use
	// let blockRange;
	// if (randomDate) {
	// 	// Use randomDate to get block range for entire day (overrides dateRange)
	// 	const startOfDay = dateStringToTimestamp(randomDate); // 00:00:00 UTC
	// 	const endOfDay = startOfDay + (24 * 60 * 60) - 1; // 23:59:59 UTC

	// 	try {
	// 		// Get accurate block heights for start and end of day using binary search
	// 		const minBlock = await getBlockHeightForTimestamp(startOfDay);
	// 		const maxBlock = await getBlockHeightForTimestamp(endOfDay);

	// 		blockRange = {
	// 			min: minBlock,
	// 			max: maxBlock
	// 		};

	// 		console.log(`Random date ${randomDate}: block range ${minBlock}-${maxBlock} (${maxBlock - minBlock + 1} blocks)`);
	// 	} catch (error) {
	// 		console.error("Error getting block heights for random date:", error);
	// 		// Fallback to regular dateRange behavior
	// 		blockRange = await buildBlockRange(filters.dateRange);
	// 	}
	// } else {
	// 	// Use dateRange as before
	// 	blockRange = await buildBlockRange(filters.dateRange);
	// }



	// Determine which block range to use
	let blockRange;
	if (randomDate) {
		// reference implementation /src/apps/Modules/LibModules/arweaveSearch/api/arweaveApi.ts
		// Use randomDate to get block range (overrides dateRange)
		const timestamp = dateStringToTimestamp(randomDate);

		try {
			// Get block height for the random datetime (single API call)
			const targetBlock = await getBlockHeightForTimestamp(timestamp);
			
			// Create a much smaller, more precise range around the target block
			// ±500 blocks ≈ ±1000 minutes ≈ ±16 hours around target time
			const rangeSize = 500;
			const minBlock = Math.max(0, targetBlock - rangeSize);
			const maxBlock = targetBlock + rangeSize;

			blockRange = {
				min: minBlock,
				max: maxBlock
			};

			console.log(`Random datetime ${randomDate}: block range ${minBlock}-${maxBlock} (${maxBlock - minBlock + 1} blocks, ~±16 hours)`);
		} catch (error) {
			console.error("Error getting block height for random date:", error);
			// Fallback to regular dateRange behavior
			blockRange = await buildBlockRange(filters.dateRange);
		}
	} else {
		// Use dateRange as before
		blockRange = await buildBlockRange(filters.dateRange);
	}

	// Build the block filter object
	let blockFilter = "";
	if (blockRange.min !== undefined || blockRange.max !== undefined) {
		const conditions = [];
		if (blockRange.min !== undefined) conditions.push(`min: ${blockRange.min}`);
		// Exclude recent blocks (~30 blocks = 1 hour) when browsing to avoid unconfirmed transactions
		if (blockRange.max !== undefined) conditions.push(`max: ${query ? blockRange.max : blockRange.max - 30}`);
		blockFilter = `block: { ${conditions.join(", ")} }`;
	}

	let queryStr = "";

	if (query) {
		queryStr = `
			query GetTransactions($after: String, $tags: [TagFilter!], $owners: [String!], $ids: [ID!]) {
				byOwners: transactions(
					first: 12,
					sort: ${sortOrder},
					after: $after,
					tags: $tags,
					owners: $owners${blockFilter ? `, ${blockFilter}` : ""}
				) {
					edges {
						cursor
						node {
							id
							data { size type }
							tags { name value }
							block { height timestamp }
						}
					}
					pageInfo { hasNextPage }
				}
				byIds: transactions(
					first: 12,
					sort: ${sortOrder},
					after: $after,
					tags: $tags,
					ids: $ids${blockFilter ? `, ${blockFilter}` : ""}
				) {
					edges {
						cursor
						node {
							id
							data { size type }
							tags { name value }
							block { height timestamp }
						}
					}
					pageInfo { hasNextPage }
				}
			}
		`;
	} else {
		queryStr = `
			query GetTransactions($after: String, $tags: [TagFilter!]) {
				transactions(
					first: 12,
					sort: ${sortOrder},
					after: $after,
					tags: $tags${blockFilter ? `, ${blockFilter}` : ""}
				) {
					edges {
						cursor
						node {
							id
							data { size type }
							tags { name value }
							block { height timestamp }
						}
					}
					pageInfo { hasNextPage }
				}
			}
		`;
	}

	const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query: queryStr,
			variables: query ? {
				after: cursor,
				tags: tags.length > 0 ? tags : undefined,
				owners: [query.trim()],
				ids: [query.trim()]
			} : {
				after: cursor,
				tags: tags.length > 0 ? tags : undefined
			}
		}),
		signal,
	});

	if (!response.ok) throw new Error("Failed to fetch transactions");

	const data: GraphQLQueryResponse = await response.json();

	if (data.errors) throw new Error( `GraphQL errors: ${data.errors.map((e: any) => e.message).join(", ")}`);

	let edges: any[] = [];
	let hasNext = false;

	if (query) {
		// Handle query with owners and ids
		const byOwnersEdges = data.data.byOwners?.edges || [];
		const byIdsEdges = data.data.byIds?.edges || [];

		// Merge all edges
		edges = [...byOwnersEdges, ...byIdsEdges];
		hasNext = (data.data.byOwners?.pageInfo.hasNextPage || false) || (data.data.byIds?.pageInfo.hasNextPage || false);
	} else {
		// Handle filters only
		edges = data.data.transactions?.edges || [];
		hasNext = data.data.transactions?.pageInfo.hasNextPage || false;
	}

	const transactions: Transaction[] = edges.map((edge) => edge.node);
	// const availableTransactions = await filterAvailableAssets(transactions, undefined, signal);
	// const transactionsWithMinted = await checkMintedStatus(availableTransactions, actor);
	const transactionsWithMinted = await checkMintedStatus(transactions, actor);

	return {
		transactions: transactionsWithMinted,
		cursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
		hasNext,
	};

}