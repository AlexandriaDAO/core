import React, { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowUpDown, Clock } from "lucide-react";
import { Button } from "@/lib/components/button";
import { useAlexBackend } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { natToArweaveId, arweaveIdToNat } from "@/utils/id_convert";
import { ARWEAVE_GRAPHQL_ENDPOINT } from "@/features/permasearch/utils/helpers";
import ArticleCard from "./ArticleCard";
import { Article, ArticleData } from "../types/article";

const APPLICATION_NAME = "Syllogos";

export type SortOption = "newest" | "oldest";

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
	{ value: "newest", label: "Newest", icon: <Clock className="h-4 w-4" /> },
	{ value: "oldest", label: "Oldest", icon: <Clock className="h-4 w-4 rotate-180" /> },
];

// Filter arweave IDs to only include those with Application-Name: Syllogos tag
async function filterSyllogosArticles(arweaveIds: string[]): Promise<Set<string>> {
	if (arweaveIds.length === 0) return new Set();

	try {
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
				variables: { ids: arweaveIds }
			})
		});

		if (!response.ok) {
			console.warn("Failed to query Arweave GraphQL");
			return new Set();
		}

		const data = await response.json();
		const edges = data?.data?.transactions?.edges || [];
		return new Set(edges.map((edge: any) => edge.node.id));
	} catch (error) {
		console.warn("Error querying Arweave GraphQL:", error);
		return new Set();
	}
}

interface ArticleFeedProps {
	userPrincipal?: string;
	filterTag?: string;
	className?: string;
	pageSize?: number;
	onTagClick?: (tag: string) => void;
	showSortControls?: boolean;
	defaultSort?: SortOption;
}

const ArticleFeed: React.FC<ArticleFeedProps> = ({
	userPrincipal,
	filterTag,
	className = "",
	pageSize = 5,
	onTagClick,
	showSortControls = true,
	defaultSort = "newest",
}) => {
	const [articles, setArticles] = useState<Article[]>([]);
	const [syllogosArweaveIds, setSyllogosArweaveIds] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState<SortOption>(defaultSort);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(0);
	const [isInitialized, setIsInitialized] = useState(false);

	const { actor } = useAlexBackend();
	const { user } = useAppSelector((state) => state.auth);

	// Fetch and filter all Syllogos articles from minted NFTs
	const initializeSyllogosArticles = useCallback(async () => {
		try {
			setLoading(true);
			const tokenAdapter = createTokenAdapter("NFT");
			const totalSupply = await tokenAdapter.getTotalSupply();
			console.log("[ArticleFeed] Total NFT supply:", totalSupply.toString());

			if (totalSupply === 0n) {
				setSyllogosArweaveIds([]);
				setIsInitialized(true);
				setLoading(false);
				return;
			}

			// Fetch ALL token IDs from NFT canister
			const allTokenIds = await tokenAdapter.getTokens(0n, totalSupply);
			console.log("[ArticleFeed] Fetched all token IDs:", allTokenIds.length);

			// Convert to Arweave IDs
			const allArweaveIds = allTokenIds.map(natToArweaveId);

			// Filter for Syllogos articles via Arweave GraphQL
			const syllogosSet = await filterSyllogosArticles(allArweaveIds);
			console.log("[ArticleFeed] Syllogos articles found:", syllogosSet.size);

			// Keep only Syllogos articles, preserving token order (for sorting)
			// Token IDs are sequential, so we can sort by them
			const syllogosTokenIds = allTokenIds.filter(tokenId =>
				syllogosSet.has(natToArweaveId(tokenId))
			);

			// Sort based on sortBy preference
			// Token IDs are minted sequentially, so higher ID = newer
			if (sortBy === "newest") {
				syllogosTokenIds.reverse(); // Newest first (highest IDs first)
			}
			// For "oldest", keep original order (lowest IDs first)

			const sortedArweaveIds = syllogosTokenIds.map(natToArweaveId);
			setSyllogosArweaveIds(sortedArweaveIds);
			setIsInitialized(true);
			console.log("[ArticleFeed] Sorted Syllogos articles:", sortedArweaveIds.length, "sortBy:", sortBy);

		} catch (err) {
			console.error("Error initializing Syllogos articles:", err);
			setError("Failed to load articles");
			setLoading(false);
		}
	}, [sortBy]);

	// Fetch a page of articles
	const fetchArticlePage = useCallback(
		async (startOffset: number, append: boolean = false) => {
			try {
				if (append) {
					setLoadingMore(true);
				} else {
					setLoading(true);
				}

				const pageArweaveIds = syllogosArweaveIds.slice(startOffset, startOffset + pageSize);

				if (pageArweaveIds.length === 0) {
					setHasMore(false);
					return;
				}

				// Get ownership information
				const tokenAdapter = createTokenAdapter("NFT");
				const tokenIds = pageArweaveIds.map(arweaveIdToNat);
				const ownershipArray = await tokenAdapter.getOwnerOf(tokenIds);

				// Process each article
				const fetchedArticles: (Article | null)[] = await Promise.all(
					pageArweaveIds.map(async (arweaveId, index) => {
						try {
							const contentResponse = await fetch(`https://arweave.net/${arweaveId}`);
							const articleData: ArticleData = await contentResponse.json();

							// Validate required fields
							if (!articleData.title || !articleData.content || !articleData.createdAt) {
								return null;
							}

							// Apply tag filter (case-insensitive)
							if (filterTag) {
								const hasMatchingTag = articleData.tags?.some(
									(tag) => tag.toLowerCase() === filterTag.toLowerCase()
								);
								if (!hasMatchingTag) return null;
							}

							// Get owner
							const ownership = ownershipArray[index];
							const owner = ownership && ownership.length > 0 ? ownership[0] : null;
							const authorPrincipal = owner ? owner.owner.toText() : "Unknown";

							// Get engagement data
							let likes = 0, dislikes = 0, comments = 0, views = 0, impressions = 0;
							let userLiked = false, userDisliked = false;

							if (actor) {
								try {
									const [reactionCounts, viewsResult, impressionsResult] = await Promise.all([
										actor.get_reaction_counts(arweaveId),
										actor.get_view_count(arweaveId),
										actor.get_impressions(arweaveId),
									]);

									if ("Ok" in reactionCounts) {
										likes = Number(reactionCounts.Ok.likes);
										dislikes = Number(reactionCounts.Ok.dislikes || 0);
										comments = Number(reactionCounts.Ok.total_comments);
									}
									if ("Ok" in viewsResult) views = Number(viewsResult.Ok);
									if ("Ok" in impressionsResult) impressions = Number(impressionsResult.Ok);

									if (user) {
										const userReaction = await actor.get_user_reaction(arweaveId);
										if ("Ok" in userReaction && userReaction.Ok.length > 0) {
											const reaction = userReaction.Ok[0];
											userLiked = !!(reaction && typeof reaction === "object" && "Like" in reaction);
											userDisliked = !!(reaction && typeof reaction === "object" && "Dislike" in reaction);
										}
									}

									// Record impression
									actor.record_impression(arweaveId).catch(() => {});
								} catch (error) {
									console.warn("Failed to fetch engagement data:", error);
								}
							}

							return {
								...articleData,
								arweaveId,
								author: authorPrincipal,
								likes,
								dislikes,
								comments,
								views,
								impressions,
								userLiked,
								userDisliked,
							} as Article;
						} catch (error) {
							console.warn("Failed to process article:", arweaveId, error);
							return null;
						}
					})
				);

				const validArticles = fetchedArticles.filter((a): a is Article => a !== null);
				const newOffset = startOffset + pageArweaveIds.length;

				if (append) {
					setArticles((prev) => [...prev, ...validArticles]);
				} else {
					setArticles(validArticles);
				}

				setHasMore(newOffset < syllogosArweaveIds.length);
				setOffset(newOffset);
			} catch (err) {
				console.error("Error fetching articles:", err);
				setError("Failed to load articles");
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[syllogosArweaveIds, pageSize, filterTag, actor, user]
	);

	// Initialize on mount and when sortBy changes
	useEffect(() => {
		setArticles([]);
		setOffset(0);
		setHasMore(true);
		setIsInitialized(false);
		initializeSyllogosArticles();
	}, [initializeSyllogosArticles]);

	// Fetch first page after initialization or when filterTag changes
	useEffect(() => {
		if (isInitialized && syllogosArweaveIds.length > 0) {
			setArticles([]);
			setOffset(0);
			setHasMore(true);
			fetchArticlePage(0, false);
		} else if (isInitialized) {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInitialized, syllogosArweaveIds, filterTag]);

	const handleLoadMore = () => {
		if (!loadingMore && hasMore) {
			fetchArticlePage(offset, true);
		}
	};

	const handleLike = async (arweaveId: string) => {
		if (!actor || !user) return;

		try {
			const result = await actor.add_reaction(arweaveId, { Like: null });
			if ("Ok" in result) {
				setArticles((prev) =>
					prev.map((article) =>
						article.arweaveId === arweaveId
							? {
									...article,
									likes: article.userLiked
										? article.likes - 1
										: article.likes + 1,
									dislikes:
										article.userDisliked && !article.userLiked
											? article.dislikes - 1
											: article.dislikes,
									userLiked: !article.userLiked,
									userDisliked: false,
							  }
							: article
					)
				);
			}
		} catch (error) {
			console.error("Failed to like article:", error);
		}
	};

	const handleDislike = async (arweaveId: string) => {
		if (!actor || !user) return;

		try {
			const result = await actor.add_reaction(arweaveId, { Dislike: null });
			if ("Ok" in result) {
				setArticles((prev) =>
					prev.map((article) =>
						article.arweaveId === arweaveId
							? {
									...article,
									dislikes: article.userDisliked
										? article.dislikes - 1
										: article.dislikes + 1,
									likes:
										article.userLiked && !article.userDisliked
											? article.likes - 1
											: article.likes,
									userDisliked: !article.userDisliked,
									userLiked: false,
							  }
							: article
					)
				);
			}
		} catch (error) {
			console.error("Failed to dislike article:", error);
		}
	};

	if (loading) {
		return (
			<div className={`flex justify-center py-12 ${className}`}>
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error) {
		return (
			<div className={`text-center py-12 ${className}`}>
				<p className="text-muted-foreground mb-4">{error}</p>
				<Button variant="outline" onClick={() => initializeSyllogosArticles()}>
					Try again
				</Button>
			</div>
		);
	}

	if (articles.length === 0) {
		return (
			<div className={`text-center py-12 ${className}`}>
				<p className="text-lg text-muted-foreground mb-2">
					{userPrincipal
						? "No articles published yet"
						: filterTag
						? `No articles found with tag "${filterTag}"`
						: "No articles to show"}
				</p>
				<p className="text-sm text-muted-foreground">
					{userPrincipal
						? "Recently published articles may take a few minutes to appear."
						: !filterTag && "Be the first to write an article!"}
				</p>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Sort Controls */}
			{showSortControls && syllogosArweaveIds.length > 1 && (
				<div className="flex items-center gap-2 pb-2">
					<ArrowUpDown className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm text-muted-foreground mr-2">Sort by:</span>
					<div className="flex flex-wrap gap-2">
						{SORT_OPTIONS.map((option) => (
							<button
								key={option.value}
								onClick={() => setSortBy(option.value)}
								className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-colors ${
									sortBy === option.value
										? "bg-primary text-primary-foreground"
										: "bg-muted hover:bg-muted/80 text-muted-foreground"
								}`}
							>
								{option.icon}
								{option.label}
							</button>
						))}
					</div>
				</div>
			)}

			{articles.map((article) => (
				<ArticleCard
					key={article.arweaveId}
					article={article}
					onLike={() => handleLike(article.arweaveId)}
					onDislike={() => handleDislike(article.arweaveId)}
					onTagClick={onTagClick}
				/>
			))}

			{hasMore && (
				<div className="text-center pt-4">
					<Button
						variant="outline"
						onClick={handleLoadMore}
						disabled={loadingMore}
					>
						{loadingMore ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Loading...
							</>
						) : (
							"Load More"
						)}
					</Button>
				</div>
			)}
		</div>
	);
};

export default ArticleFeed;
