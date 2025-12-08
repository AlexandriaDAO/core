import React, { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowUpDown, Clock } from "lucide-react";
import PostCard from "./PostCard";
import { Button } from "@/lib/components/button";
import { useAlexBackend } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { natToArweaveId, arweaveIdToNat } from "@/utils/id_convert";
import { ARWEAVE_GRAPHQL_ENDPOINT } from "@/features/permasearch/utils/helpers";
import { APPLICATION_NAME } from "../types/post";

interface Post {
	arweaveId: string;
	author: string;
	timestamp: string;
	content?: string;
	mediaType?: string;
	mediaUrl?: string;
	likes: number;
	dislikes: number;
	comments: number;
	views: number;
	impressions: number;
	userLiked: boolean;
	userDisliked: boolean;
}

export type SortOption = "newest" | "oldest";

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
	{ value: "newest", label: "Newest", icon: <Clock className="h-4 w-4" /> },
	{ value: "oldest", label: "Oldest", icon: <Clock className="h-4 w-4 rotate-180" /> },
];

// Filter arweave IDs to only include those with Application-Name: Dialectica tag
async function filterDialecticaPosts(arweaveIds: string[]): Promise<Set<string>> {
	if (arweaveIds.length === 0) return new Set();

	try {
		const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				query: `
					query FilterDialecticaPosts($ids: [ID!]!) {
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

interface PostFeedProps {
	userPrincipal?: string;
	className?: string;
	pageSize?: number;
	showSortControls?: boolean;
	defaultSort?: SortOption;
}

const PostFeed: React.FC<PostFeedProps> = ({
	userPrincipal,
	className = "",
	pageSize = 10,
	showSortControls = true,
	defaultSort = "newest",
}) => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [dialecticaArweaveIds, setDialecticaArweaveIds] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState<SortOption>(defaultSort);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [offset, setOffset] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);

	const { actor } = useAlexBackend();
	const { user } = useAppSelector((state) => state.auth);

	// Fetch and filter all Dialectica posts from minted NFTs
	const initializeDialecticaPosts = useCallback(async () => {
		try {
			setLoading(true);
			const tokenAdapter = createTokenAdapter("NFT");
			const totalSupply = await tokenAdapter.getTotalSupply();
			console.log("[PostFeed] Total NFT supply:", totalSupply.toString());

			if (totalSupply === 0n) {
				setDialecticaArweaveIds([]);
				setIsInitialized(true);
				setLoading(false);
				return;
			}

			// Fetch ALL token IDs from NFT canister
			const allTokenIds = await tokenAdapter.getTokens(0n, totalSupply);
			console.log("[PostFeed] Fetched all token IDs:", allTokenIds.length);

			// Convert to Arweave IDs
			const allArweaveIds = allTokenIds.map(natToArweaveId);

			// Filter for Dialectica posts via Arweave GraphQL
			const dialecticaSet = await filterDialecticaPosts(allArweaveIds);
			console.log("[PostFeed] Dialectica posts found:", dialecticaSet.size);

			// Keep only Dialectica posts, preserving token order (for sorting)
			let dialecticaTokenIds = allTokenIds.filter(tokenId =>
				dialecticaSet.has(natToArweaveId(tokenId))
			);

			// If userPrincipal is provided, filter by owner
			if (userPrincipal) {
				const ownershipArray = await tokenAdapter.getOwnerOf(dialecticaTokenIds);
				dialecticaTokenIds = dialecticaTokenIds.filter((_, index) => {
					const ownership = ownershipArray[index];
					const owner = ownership && ownership.length > 0 ? ownership[0] : null;
					return owner && owner.owner.toText() === userPrincipal;
				});
			}

			// Sort based on sortBy preference
			// Token IDs are minted sequentially, so higher ID = newer
			if (sortBy === "newest") {
				dialecticaTokenIds.reverse(); // Newest first (highest IDs first)
			}
			// For "oldest", keep original order (lowest IDs first)

			const sortedArweaveIds = dialecticaTokenIds.map(natToArweaveId);
			setDialecticaArweaveIds(sortedArweaveIds);
			setIsInitialized(true);
			console.log("[PostFeed] Sorted Dialectica posts:", sortedArweaveIds.length, "sortBy:", sortBy);

		} catch (err) {
			console.error("Error initializing Dialectica posts:", err);
			setError("Failed to load posts");
			setLoading(false);
		}
	}, [sortBy, userPrincipal]);

	// Fetch a page of posts
	const fetchPostPage = useCallback(
		async (startOffset: number, append: boolean = false) => {
			try {
				if (append) {
					setLoadingMore(true);
				} else {
					setLoading(true);
				}

				const pageArweaveIds = dialecticaArweaveIds.slice(startOffset, startOffset + pageSize);

				if (pageArweaveIds.length === 0) {
					setHasMore(false);
					return;
				}

				// Get ownership information
				const tokenAdapter = createTokenAdapter("NFT");
				const tokenIds = pageArweaveIds.map(arweaveIdToNat);
				const ownershipArray = await tokenAdapter.getOwnerOf(tokenIds);

				// Process each post
				const fetchedPosts: (Post | null)[] = await Promise.all(
					pageArweaveIds.map(async (arweaveId, index) => {
						try {
							// Get owner
							const ownership = ownershipArray[index];
							const owner = ownership && ownership.length > 0 ? ownership[0] : null;
							const authorPrincipal = owner ? owner.owner.toText() : "Unknown";

							// Fetch post content
							const contentResponse = await fetch(`https://arweave.net/${arweaveId}`);
							const rawContent = await contentResponse.text();

							// Parse JSON post data
							let content = "";
							let postTimestamp: number = Date.now();
							let postMediaArweaveId: string | undefined;
							let postMediaType: string | undefined;

							try {
								const jsonData = JSON.parse(rawContent);
								content = jsonData.content || jsonData.text || "";
								if (jsonData.createdAt) {
									postTimestamp = Number(jsonData.createdAt);
								} else if (jsonData.timestamp) {
									postTimestamp = Number(jsonData.timestamp);
								}
								// Extract media reference if present
								if (jsonData.mediaArweaveId) {
									postMediaArweaveId = jsonData.mediaArweaveId;
									postMediaType = jsonData.mediaType;
								}
							} catch {
								// Not JSON, treat as plain text
								content = rawContent;
							}

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
								arweaveId,
								author: authorPrincipal,
								timestamp: postTimestamp.toString(),
								content: content || undefined,
								mediaType: postMediaArweaveId ? postMediaType : undefined,
								mediaUrl: postMediaArweaveId ? `https://arweave.net/${postMediaArweaveId}` : undefined,
								likes,
								dislikes,
								comments,
								views,
								impressions,
								userLiked,
								userDisliked,
							} as Post;
						} catch (error) {
							console.warn("Failed to process post:", arweaveId, error);
							return null;
						}
					})
				);

				const validPosts = fetchedPosts.filter((p): p is Post => p !== null);
				const newOffset = startOffset + pageArweaveIds.length;

				if (append) {
					setPosts((prev) => [...prev, ...validPosts]);
				} else {
					setPosts(validPosts);
				}

				setHasMore(newOffset < dialecticaArweaveIds.length);
				setOffset(newOffset);
			} catch (err) {
				console.error("Error fetching posts:", err);
				setError("Failed to load posts");
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[dialecticaArweaveIds, pageSize, actor, user]
	);

	// Initialize on mount and when sortBy changes
	useEffect(() => {
		setPosts([]);
		setOffset(0);
		setHasMore(true);
		setIsInitialized(false);
		initializeDialecticaPosts();
	}, [initializeDialecticaPosts]);

	// Fetch first page after initialization
	useEffect(() => {
		if (isInitialized && dialecticaArweaveIds.length > 0) {
			setPosts([]);
			setOffset(0);
			setHasMore(true);
			fetchPostPage(0, false);
		} else if (isInitialized) {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInitialized, dialecticaArweaveIds]);

	const handleLoadMore = () => {
		if (!loadingMore && hasMore) {
			fetchPostPage(offset, true);
		}
	};

	const handleLike = async (arweaveId: string) => {
		if (!actor || !user) return;

		try {
			const result = await actor.add_reaction(arweaveId, { Like: null });
			if ("Ok" in result) {
				setPosts((prev) =>
					prev.map((post) =>
						post.arweaveId === arweaveId
							? {
									...post,
									likes: post.userLiked ? post.likes - 1 : post.likes + 1,
									dislikes: post.userDisliked && !post.userLiked ? post.dislikes - 1 : post.dislikes,
									userLiked: !post.userLiked,
									userDisliked: false,
							  }
							: post
					)
				);
			}
		} catch (error) {
			console.error("Failed to like post:", error);
		}
	};

	const handleDislike = async (arweaveId: string) => {
		if (!actor || !user) return;

		try {
			const result = await actor.add_reaction(arweaveId, { Dislike: null });
			if ("Ok" in result) {
				setPosts((prev) =>
					prev.map((post) =>
						post.arweaveId === arweaveId
							? {
									...post,
									dislikes: post.userDisliked ? post.dislikes - 1 : post.dislikes + 1,
									likes: post.userLiked && !post.userDisliked ? post.likes - 1 : post.likes,
									userDisliked: !post.userDisliked,
									userLiked: false,
							  }
							: post
					)
				);
			}
		} catch (error) {
			console.error("Failed to dislike post:", error);
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
				<Button variant="outline" onClick={() => initializeDialecticaPosts()}>
					Try again
				</Button>
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<div className={`text-center py-12 ${className}`}>
				<p className="text-lg text-muted-foreground mb-2">
					{userPrincipal ? "No posts yet" : "No posts to show"}
				</p>
				<p className="text-sm text-muted-foreground">
					{userPrincipal
						? "Recently published posts may take a few minutes to appear."
						: "Be the first to post something!"}
				</p>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Sort Controls */}
			{showSortControls && dialecticaArweaveIds.length > 1 && (
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

			{posts.map((post) => (
				<PostCard
					key={post.arweaveId}
					arweaveId={post.arweaveId}
					author={post.author}
					timestamp={post.timestamp}
					content={post.content}
					mediaType={post.mediaType}
					mediaUrl={post.mediaUrl}
					likes={post.likes}
					dislikes={post.dislikes}
					comments={post.comments}
					impressions={post.impressions}
					userLiked={post.userLiked}
					userDisliked={post.userDisliked}
					onLike={() => handleLike(post.arweaveId)}
					onDislike={() => handleDislike(post.arweaveId)}
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

export default PostFeed;
