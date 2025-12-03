import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import useDialectica from "@/hooks/actors/useDialectica";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { natToArweaveId } from "@/utils/id_convert";
import { ARWEAVE_GRAPHQL_ENDPOINT } from "@/features/permasearch/utils/helpers";
import { Principal } from "@dfinity/principal";
import ArticleCard from "./ArticleCard";
import { Article, ArticleData } from "../types/article";

const APPLICATION_NAME = "Syllogos";

// Query Arweave GraphQL to filter transactions by Application-Name tag
async function filterByApplicationTag(arweaveIds: string[]): Promise<Set<string>> {
	if (arweaveIds.length === 0) return new Set();

	try {
		const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				query: `
					query GetSyllogosArticles($ids: [ID!]!) {
						transactions(ids: $ids, tags: [{ name: "Application-Name", values: ["${APPLICATION_NAME}"] }]) {
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
}

const ArticleFeed: React.FC<ArticleFeedProps> = ({
	userPrincipal,
	filterTag,
	className = "",
	pageSize = 20,
	onTagClick,
}) => {
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(0);

	const { actor } = useDialectica();
	const { user } = useAppSelector((state) => state.auth);

	const fetchArticles = useCallback(
		async (startOffset: number, append: boolean = false) => {
			try {
				if (append) {
					setLoadingMore(true);
				} else {
					setLoading(true);
				}

				const tokenAdapter = createTokenAdapter("NFT");
				const totalSupply = await tokenAdapter.getTotalSupply();

				if (totalSupply === 0n) {
					setArticles([]);
					setHasMore(false);
					return;
				}

				let tokenIds: bigint[] = [];

				if (userPrincipal) {
					// Fetch tokens for specific user
					// cursor should be undefined for first page, otherwise use last token ID
					tokenIds = await tokenAdapter.getTokensOf(
						Principal.fromText(userPrincipal),
						startOffset > 0 ? BigInt(startOffset) : undefined,
						BigInt(pageSize)
					);
				} else {
					// Fetch recent tokens (newest first)
					const startPosition = Math.max(
						0,
						Number(totalSupply) - startOffset - pageSize
					);
					const fetchSize = Math.min(
						pageSize,
						Number(totalSupply) - startOffset
					);

					if (fetchSize <= 0) {
						setHasMore(false);
						return;
					}

					tokenIds = await tokenAdapter.getTokens(
						BigInt(startPosition),
						BigInt(fetchSize)
					);
					tokenIds = tokenIds.reverse(); // Show newest first
				}

				if (tokenIds.length === 0) {
					setHasMore(false);
					return;
				}

				// Convert token IDs to Arweave IDs
				const arweaveIds = tokenIds.map(natToArweaveId);

				// Filter by Application-Name tag via Arweave GraphQL
				const syllogosIds = await filterByApplicationTag(arweaveIds);

				if (syllogosIds.size === 0) {
					if (!append) {
						setArticles([]);
					}
					setHasMore(tokenIds.length === pageSize);
					setOffset(startOffset + tokenIds.length);
					return;
				}

				// Filter tokenIds to only include Syllogos articles
				const filteredTokenIds = tokenIds.filter((tokenId) =>
					syllogosIds.has(natToArweaveId(tokenId))
				);

				// Get ownership information for filtered tokens
				const ownershipArray = await tokenAdapter.getOwnerOf(filteredTokenIds);

				// Process each filtered token
				const fetchedArticles: (Article | null)[] = await Promise.all(
					filteredTokenIds.map(async (tokenId, index) => {
						try {
							const arweaveId = natToArweaveId(tokenId);

							// Fetch article content
							const contentResponse = await fetch(
								`https://arweave.net/${arweaveId}`
							);
							const articleData: ArticleData = await contentResponse.json();

							// Validate it's actually an article (has required fields)
							if (
								!articleData.title ||
								!articleData.content ||
								!articleData.createdAt
							) {
								return null;
							}

							// Apply tag filter if specified
							if (
								filterTag &&
								(!articleData.tags ||
									!articleData.tags.includes(filterTag.toLowerCase()))
							) {
								return null;
							}

							// Get owner info
							const ownership = ownershipArray[index];
							const owner =
								ownership && ownership.length > 0 ? ownership[0] : null;
							const authorPrincipal = owner
								? owner.owner.toText()
								: "Unknown";

							// Get engagement data
							let likes = 0;
							let dislikes = 0;
							let comments = 0;
							let userLiked = false;
							let userDisliked = false;

							if (actor) {
								try {
									const reactionCounts =
										await actor.get_reaction_counts(arweaveId);
									if ("Ok" in reactionCounts) {
										likes = Number(reactionCounts.Ok.likes);
										dislikes = Number(reactionCounts.Ok.dislikes || 0);
										comments = Number(reactionCounts.Ok.total_comments);
									}

									if (user) {
										const userReaction =
											await actor.get_user_reaction(arweaveId);
										if (
											"Ok" in userReaction &&
											userReaction.Ok.length > 0
										) {
											const reaction = userReaction.Ok[0];
											userLiked =
												(reaction &&
													typeof reaction === "object" &&
													"Like" in reaction) ||
												false;
											userDisliked =
												(reaction &&
													typeof reaction === "object" &&
													"Dislike" in reaction) ||
												false;
										}
									}
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
								userLiked,
								userDisliked,
							} as Article;
						} catch (error) {
							console.warn("Failed to process token:", tokenId, error);
							return null;
						}
					})
				);

				// Filter out nulls and non-articles
				const validArticles = fetchedArticles.filter(
					(a): a is Article => a !== null
				);

				if (append) {
					setArticles((prev) => [...prev, ...validArticles]);
				} else {
					setArticles(validArticles);
				}

				// Check if there are more articles to load
				setHasMore(tokenIds.length === pageSize);
				setOffset(startOffset + tokenIds.length);
			} catch (err) {
				console.error("Error fetching articles:", err);
				setError("Failed to load articles");
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[userPrincipal, filterTag, pageSize, actor, user]
	);

	useEffect(() => {
		setArticles([]);
		setOffset(0);
		setHasMore(true);
		fetchArticles(0, false);
	}, [fetchArticles]);

	const handleLoadMore = () => {
		if (!loadingMore && hasMore) {
			fetchArticles(offset, true);
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
				<Button variant="outline" onClick={() => fetchArticles(0, false)}>
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
