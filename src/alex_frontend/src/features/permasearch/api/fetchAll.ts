import { ARWEAVE_GRAPHQL_ENDPOINT } from "../utils";
import { type GraphQLQueryResponse, type QueryParams, TransactionFields, QueryResult } from "../types";

export async function fetchAll({ order, after, tags, range, signal}: QueryParams): Promise<QueryResult> {
	try {
		const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				query: `
					query Get($order: SortOrder, $after: String, $tags: [TagFilter!], $range: BlockFilter) {
						transactions(first: 100, sort: $order, after: $after, tags: $tags, block: $range) {
							${TransactionFields}
						}
					}
				`,
				variables: { order, after, tags, range },
			}),
			signal,
		});

		if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch transactions by owners`);

		const data: GraphQLQueryResponse = await response.json();

		if (data.errors) throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(", ")}`);

		const transactions = data.data.transactions;

		const edges = transactions?.edges || [];

		return {
			transactions: edges.map((edge) => edge.node),
			cursor: edges[edges.length - 1]?.cursor || null,
			hasNext: transactions?.pageInfo.hasNextPage || false,
		};
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw error;
		}
	}
	return {
		transactions: [],
		cursor: null,
		hasNext: false,
	};
}