import { useState, useEffect } from "react";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { natToArweaveId } from "@/utils/id_convert";
import { ARWEAVE_GRAPHQL_ENDPOINT } from "@/features/permasearch/utils/helpers";
import { ArticleData } from "../types/article";

const APPLICATION_NAME = "Syllogos";
const MAX_ARTICLES_TO_FETCH = 100;
const MAX_TAGS_TO_RETURN = 10;
const CACHE_KEY = "syllogos_popular_tags";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedTags {
	tags: { tag: string; count: number }[];
	timestamp: number;
}

interface UsePopularTagsResult {
	tags: { tag: string; count: number }[];
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

/**
 * Fetches the most popular tags from recent Syllogos articles
 */
export function usePopularTags(): UsePopularTagsResult {
	const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchPopularTags = async () => {
		// Check cache first
		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (cached) {
				const parsedCache: CachedTags = JSON.parse(cached);
				if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
					setTags(parsedCache.tags);
					setLoading(false);
					return;
				}
			}
		} catch {
			// Cache read failed, continue with fetch
		}

		try {
			setLoading(true);
			setError(null);

			// Step 1: Get all NFT token IDs
			const tokenAdapter = createTokenAdapter("NFT");
			const totalSupply = await tokenAdapter.getTotalSupply();

			if (totalSupply === 0n) {
				setTags([]);
				setLoading(false);
				return;
			}

			// Get tokens (newest first - higher IDs are newer)
			const tokensToFetch = totalSupply > BigInt(MAX_ARTICLES_TO_FETCH * 2)
				? BigInt(MAX_ARTICLES_TO_FETCH * 2)
				: totalSupply;

			const startIndex = totalSupply > tokensToFetch ? totalSupply - tokensToFetch : 0n;
			const allTokenIds = await tokenAdapter.getTokens(startIndex, tokensToFetch);

			// Reverse to get newest first
			const tokenIds = [...allTokenIds].reverse();
			const allArweaveIds = tokenIds.map(natToArweaveId);

			// Step 2: Filter for Syllogos articles via Arweave GraphQL
			const syllogosArweaveIds = await filterSyllogosArticles(allArweaveIds);

			if (syllogosArweaveIds.length === 0) {
				setTags([]);
				setLoading(false);
				return;
			}

			// Take only the first MAX_ARTICLES_TO_FETCH
			const articlesToProcess = syllogosArweaveIds.slice(0, MAX_ARTICLES_TO_FETCH);

			// Step 3: Fetch article content and extract tags
			const tagCounts = new Map<string, number>();

			// Fetch in batches to avoid overwhelming the network
			const batchSize = 10;
			for (let i = 0; i < articlesToProcess.length; i += batchSize) {
				const batch = articlesToProcess.slice(i, i + batchSize);

				const results = await Promise.allSettled(
					batch.map(async (arweaveId) => {
						const response = await fetch(`https://arweave.net/${arweaveId}`);
						if (!response.ok) return null;
						const data: ArticleData = await response.json();
						return data.tags || [];
					})
				);

				for (const result of results) {
					if (result.status === "fulfilled" && result.value) {
						for (const tag of result.value) {
							const normalizedTag = tag.toLowerCase().trim();
							if (normalizedTag) {
								tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
							}
						}
					}
				}
			}

			// Step 4: Sort by count and take top tags
			const sortedTags = Array.from(tagCounts.entries())
				.map(([tag, count]) => ({ tag, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, MAX_TAGS_TO_RETURN);

			// Cache the results
			try {
				const cacheData: CachedTags = {
					tags: sortedTags,
					timestamp: Date.now(),
				};
				localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
			} catch {
				// Cache write failed, ignore
			}

			setTags(sortedTags);
		} catch (err) {
			console.error("Error fetching popular tags:", err);
			setError("Failed to load popular tags");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPopularTags();
	}, []);

	return { tags, loading, error, refetch: fetchPopularTags };
}

/**
 * Filter arweave IDs to only include those with Application-Name: Syllogos tag
 */
async function filterSyllogosArticles(arweaveIds: string[]): Promise<string[]> {
	if (arweaveIds.length === 0) return [];

	try {
		// Query in batches of 100 to avoid GraphQL limits
		const batchSize = 100;
		const allSyllogosIds: string[] = [];

		for (let i = 0; i < arweaveIds.length; i += batchSize) {
			const batch = arweaveIds.slice(i, i + batchSize);

			const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					query: `
						query FilterSyllogosArticles($ids: [ID!]!) {
							transactions(
								ids: $ids
								tags: [{ name: "Application-Name", values: ["${APPLICATION_NAME}"] }]
							) {
								edges {
									node {
										id
									}
								}
							}
						}
					`,
					variables: { ids: batch }
				})
			});

			if (!response.ok) {
				console.warn("Failed to query Arweave GraphQL");
				continue;
			}

			const data = await response.json();
			const edges = data?.data?.transactions?.edges || [];
			const ids = edges.map((edge: any) => edge.node.id);
			allSyllogosIds.push(...ids);
		}

		// Preserve original order
		return arweaveIds.filter(id => allSyllogosIds.includes(id));
	} catch (error) {
		console.warn("Error querying Arweave GraphQL:", error);
		return [];
	}
}

export default usePopularTags;
