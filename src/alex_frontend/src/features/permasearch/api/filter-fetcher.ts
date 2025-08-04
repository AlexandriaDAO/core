import type { ActorSubclass } from "@dfinity/agent";
import { ARWEAVE_GRAPHQL_ENDPOINT, checkMintedStatus } from "./utils";
import type { _SERVICE } from "../../../../../declarations/nft_manager/nft_manager.did";
import { SearchResponse, GraphQLQueryResponse, Transaction, TagFilter, Filters } from "../types";
import { estimateBlockHeight, getCurrentBlockHeight } from "../utils";

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

async function buildBlockRange(dateRange: { from?: string; to?: string }): Promise<{ min?: number; max?: number }> {
	if (!dateRange.from && !dateRange.to) {
		return {};
	}

	try {
		const currentBlockHeight = await getCurrentBlockHeight();
		let minBlock: number | undefined;
		let maxBlock: number | undefined;

		if (dateRange.from) {
			const fromDate = new Date(dateRange.from);
			const fromTimestamp = Math.floor(fromDate.getTime() / 1000);
			minBlock = estimateBlockHeight(fromTimestamp, currentBlockHeight);
		}

		if (dateRange.to) {
			const toDate = new Date(dateRange.to);
			toDate.setHours(23, 59, 59, 999); // End of day
			const toTimestamp = Math.floor(toDate.getTime() / 1000);
			maxBlock = estimateBlockHeight(toTimestamp, currentBlockHeight);
		}

		return { min: minBlock, max: maxBlock };
	} catch (error) {
		console.warn('Failed to build block range from date range:', error);
		return {};
	}
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
			transactions(first: 12, sort: ${sortOrder}, after: $after, tags: $tags${blockFilter ? `, ${blockFilter}` : ""}) {
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
