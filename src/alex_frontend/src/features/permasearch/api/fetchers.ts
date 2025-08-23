import { SearchResponse, SearchParams, GraphQLQueryResponse } from "../types";
import { ARWEAVE_GRAPHQL_ENDPOINT, buildTagFilters, buildBlockFilters, checkMintedStatus } from "../utils";

export async function fetchSearchResults({ query, filters, sortOrder, cursor, actor, signal, timestamp }: SearchParams & { signal?: AbortSignal; }): Promise<SearchResponse> {
	const tags = buildTagFilters(filters);

	const blockRange = await buildBlockFilters(timestamp, filters.include);

	const transactionFields = `
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
	`;

	const blockFilter = `block: { min: ${blockRange.min}, max: ${blockRange.max} }`;

	const queryStr = query ?
		`query GetTransactions($after: String, $tags: [TagFilter!], $owners: [String!], $ids: [ID!]) {
			byOwners: transactions(first: 24, sort: ${sortOrder}, after: $after, tags: $tags, owners: $owners, ${blockFilter}) { ${transactionFields} }
			byIds: transactions(first: 24, sort: ${sortOrder}, after: $after, tags: $tags, ids: $ids, ${blockFilter}) { ${transactionFields} }
		}` :
		`query GetTransactions($after: String, $tags: [TagFilter!]) {
			transactions(first: 24, sort: ${sortOrder}, after: $after, tags: $tags, ${blockFilter}) { ${transactionFields} }
		}`;

	const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query: queryStr,
			variables: {
				after: cursor,
				tags: tags.length > 0 ? tags : undefined,
				owners: query ? [query.trim()] : undefined,
				ids: query ? [query.trim()] : undefined
			}
		}),
		signal,
	});

	if (!response.ok) throw new Error("Failed to fetch transactions");

	const data: GraphQLQueryResponse = await response.json();

	if (data.errors) throw new Error( `GraphQL errors: ${data.errors.map((e: any) => e.message).join(", ")}`);

	const { byOwners, byIds, transactions: regularTransactions } = data.data;

	const edges = query ? [...(byOwners?.edges || []), ...(byIds?.edges || [])] : regularTransactions?.edges || [];

	const hasNext = query ? (byOwners?.pageInfo.hasNextPage || byIds?.pageInfo.hasNextPage || false) : (regularTransactions?.pageInfo.hasNextPage || false);

	const transactions = edges.map((edge) => edge.node);

	const transactionsWithMinted = await checkMintedStatus(transactions, actor);

	return {
		transactions: transactionsWithMinted,
		cursor: edges[edges.length - 1]?.cursor || null,
		hasNext,
	};
}