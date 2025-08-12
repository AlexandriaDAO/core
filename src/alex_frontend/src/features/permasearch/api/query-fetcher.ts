import {
	GraphQLEdge,
	GraphQLPageInfo,
	SearchResponse,
	Transaction,
} from "../types";
import {
	ARWEAVE_GRAPHQL_ENDPOINT,
	checkMintedStatus
} from "./utils";
import type { ActorSubclass } from "@dfinity/agent";
import type { _SERVICE } from "../../../../../declarations/nft_manager/nft_manager.did";


interface GraphQLQueryResponse {
	data: {
		byOwner?: {
			edges: GraphQLEdge[];
			pageInfo: GraphQLPageInfo;
		};
		byId?: Transaction;
		transactions?: {
			edges: GraphQLEdge[];
			pageInfo: GraphQLPageInfo;
		};
	};
	errors?: Array<{ message: string }>;
}

export async function fetchByQuery({
	query,
	sortOrder,
	cursor,
	actor,
	signal,
}: {
	query: string;
	sortOrder: string;
	cursor?: string;
	actor?: ActorSubclass<_SERVICE>;
	signal?: AbortSignal;
}): Promise<SearchResponse> {
	if (query.trim().length < 43) {
		throw new Error("Search query must be at least 43 characters long");
	}

	const queryStr = `
    query GetTransactions($after: String, $ownerQuery: String!, $idQuery: ID!) {
		byOwner: transactions(first: 12, sort: ${sortOrder}, after: $after, owners: [$ownerQuery]) {
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
		byId: transaction(id: $idQuery) {
			id
			data { size type }
			tags { name value }
			block { height timestamp }
		}
	}`;

	const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query: queryStr,
			variables: {
				after: cursor,
				ownerQuery: query.trim(),
				idQuery: query.trim(),
			},
		}),
		signal,
	});

	if (!response.ok) throw new Error("Failed to fetch transactions");

	const data: GraphQLQueryResponse = await response.json();

	if (data.errors) throw new Error( `GraphQL errors: ${data.errors.map((e: any) => e.message).join(", ")}`);

	const byOwnerEdges = data.data.byOwner?.edges || [];
	const isOwnerSearch = byOwnerEdges.length > 0;

	const byId: Transaction[] = data.data.byId ? [data.data.byId] : [];
	const transactions: Transaction[] = isOwnerSearch ? byOwnerEdges.map((edge) => edge.node) : byId;

	const transactionsWithMinted = await checkMintedStatus(transactions, actor);

	return {
		transactions: transactionsWithMinted,
		cursor: isOwnerSearch && byOwnerEdges.length > 0 ? byOwnerEdges[byOwnerEdges.length - 1].cursor : null,
		hasNext: isOwnerSearch ? data.data.byOwner?.pageInfo.hasNextPage || false : false,
	};
}
