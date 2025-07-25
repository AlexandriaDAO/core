import type { ActorSubclass } from "@dfinity/agent";
import { ARWEAVE_GRAPHQL_ENDPOINT, checkMintedStatus } from "./utils";
import type { _SERVICE } from "../../../../../declarations/nft_manager/nft_manager.did";
import { SearchResponse, GraphQLQueryResponse, Transaction, TagFilter, Filters } from "../types";

function buildTagFilters(filters: Filters): TagFilter[] {
	const tags: TagFilter[] = [];
	const allContentTypes = [...filters.types];

	if (filters.customType.trim()) allContentTypes.push(filters.customType.trim());

	if (allContentTypes.length > 0) {
		tags.push({
			name: "Content-Type",
			values: allContentTypes,
		});
	}

	filters.tags.forEach((tag) => {
		const existingTag = tags.find((t) => t.name === tag.name);
		if (existingTag) {
			if (!existingTag.values.includes(tag.value)) {
				existingTag.values.push(tag.value);
			}
		} else {
			tags.push({ name: tag.name, values: [tag.value] });
		}
	});

	return tags;
}


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

	const queryStr = `
		query GetTransactions($after: String, $tags: [TagFilter!]) {
			transactions(first: 12, sort: ${sortOrder}, after: $after, tags: $tags) {
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
