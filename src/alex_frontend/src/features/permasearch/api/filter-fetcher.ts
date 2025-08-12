import type { ActorSubclass } from "@dfinity/agent";
import { ARWEAVE_GRAPHQL_ENDPOINT, checkMintedStatus } from "./utils";
import type { _SERVICE } from "../../../../../declarations/nft_manager/nft_manager.did";
import { SearchResponse, GraphQLQueryResponse, Transaction, Filters } from "../types";
import { buildBlockRange, buildTagFilters } from "./utils";

export async function fetchByFilters({
	filters,
	sortOrder,
	cursor,
	actor,
	signal,
}: {
	filters: Filters;
	sortOrder: string;
	cursor?: string;
	actor?: ActorSubclass<_SERVICE>;
	signal?: AbortSignal;
}): Promise<SearchResponse> {
	const tags = buildTagFilters(filters);
	const blockRange = await buildBlockRange(filters.dateRange);

	// Build the block filter object
	let blockFilter = "";
	if (blockRange.min !== undefined || blockRange.max !== undefined) {
		const conditions = [];
		if (blockRange.min !== undefined) conditions.push(`min: ${blockRange.min}`);
		if (blockRange.max !== undefined) conditions.push(`max: ${blockRange.max}`);
		blockFilter = `block: { ${conditions.join(", ")} }`;
	}

	const queryStr = `
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

	const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query: queryStr,
			variables: { after: cursor, tags: tags.length > 0 ? tags : undefined }
		}),
		signal,
	});

	if (!response.ok) throw new Error("Failed to fetch transactions");

	const data: GraphQLQueryResponse = await response.json();

	if (data.errors) throw new Error( `GraphQL errors: ${data.errors.map((e: any) => e.message).join(", ")}`);

	const edges = data.data.transactions?.edges || [];
	const transactions: Transaction[] = edges.map((edge) => edge.node);

	const transactionsWithMinted = await checkMintedStatus(transactions, actor);

	return {
		transactions: transactionsWithMinted,
		cursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
		hasNext: data.data.transactions?.pageInfo.hasNextPage || false,
	};
}
