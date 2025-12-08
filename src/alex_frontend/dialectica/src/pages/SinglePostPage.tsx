import React, { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, Copy, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent, CardHeader } from "@/lib/components/card";
import { useParams, useRouter } from "@tanstack/react-router";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { arweaveIdToNat } from "@/utils/id_convert";
import PostCard from "../components/PostCard";
import { useAlexBackend } from "@/hooks/actors";
import { AddComment, CommentList } from "@/components/Comment";
import { toast } from "sonner";

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

const SinglePostPage: React.FC = () => {
	const { arweaveId } = useParams({ from: "/_auth/post/$arweaveId" });
	const router = useRouter();
	const [post, setPost] = useState<Post | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const { actor } = useAlexBackend();
	const { user } = useAppSelector((state) => state.auth);

	const fetchPost = async () => {
		try {
			setLoading(true);
			setError(null);

			// Get ownership information for this arweave ID
			const tokenAdapter = createTokenAdapter("NFT");
			const tokenId = arweaveIdToNat(arweaveId);
			const ownershipArray = await tokenAdapter.getOwnerOf([tokenId]);
			const ownership = ownershipArray[0];
			const owner = ownership && ownership.length > 0 ? ownership[0] : null;

			if (!owner) {
				setError("Post not found");
				return;
			}

			const authorPrincipal = owner.owner.toText();

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

					// Record view for single post page
					actor.record_view(arweaveId).catch(() => {});
				} catch (error) {
					console.warn("Failed to fetch engagement data:", error);
				}
			}

			setPost({
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
			});
		} catch (err) {
			console.error("Error fetching post:", err);
			setError("Failed to load post");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (arweaveId) {
			fetchPost();
		}
	}, [arweaveId, actor]);

	const handleLike = async () => {
		if (!actor || !user || !post) return;

		try {
			const result = await actor.add_reaction(arweaveId, { Like: null });
			if ("Ok" in result) {
				setPost((prev) =>
					prev
						? {
								...prev,
								likes: prev.userLiked ? prev.likes - 1 : prev.likes + 1,
								dislikes: prev.userDisliked && !prev.userLiked ? prev.dislikes - 1 : prev.dislikes,
								userLiked: !prev.userLiked,
								userDisliked: false,
						  }
						: null
				);
			}
		} catch (error) {
			console.error("Failed to like post:", error);
		}
	};

	const handleDislike = async () => {
		if (!actor || !user || !post) return;

		try {
			const result = await actor.add_reaction(arweaveId, { Dislike: null });
			if ("Ok" in result) {
				setPost((prev) =>
					prev
						? {
								...prev,
								dislikes: prev.userDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
								likes: prev.userLiked && !prev.userDisliked ? prev.likes - 1 : prev.likes,
								userDisliked: !prev.userDisliked,
								userLiked: false,
						  }
						: null
				);
			}
		} catch (error) {
			console.error("Failed to dislike post:", error);
		}
	};

	const handleCopyArweaveId = () => {
		navigator.clipboard.writeText(arweaveId);
		toast.success("Arweave ID copied to clipboard!");
	};

	const handleViewOnArweave = () => {
		window.open(`https://arweave.net/${arweaveId}`, "_blank");
	};

	const handleGoBack = () => {
		router.history.back();
	};

	const handleCommentAdded = () => {
		setRefreshTrigger((prev) => prev + 1);
		if (post) {
			setPost((prev) => (prev ? { ...prev, comments: prev.comments + 1 } : null));
		}
	};

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto py-12">
				<div className="flex justify-center">
					<Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
				</div>
			</div>
		);
	}

	if (error || !post) {
		return (
			<div className="max-w-4xl mx-auto py-12">
				<Card>
					<CardContent className="text-center py-12">
						<AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
						<h1 className="text-2xl font-roboto-condensed font-semibold mb-4">
							{error || "Post Not Found"}
						</h1>
						<p className="text-muted-foreground mb-6">
							This post may have been deleted or the link is invalid.
						</p>
						<Button onClick={handleGoBack} variant="outline">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Go Back
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button onClick={handleGoBack} variant="ghost" className="gap-2">
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
				<div className="flex gap-2">
					<Button onClick={handleCopyArweaveId} variant="outline" scale="sm" className="gap-2">
						<Copy className="h-4 w-4" />
						Copy ID
					</Button>
					<Button onClick={handleViewOnArweave} variant="outline" scale="sm" className="gap-2">
						<ExternalLink className="h-4 w-4" />
						View on Arweave
					</Button>
				</div>
			</div>

			{/* Post */}
			<PostCard
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
				onLike={handleLike}
				onDislike={handleDislike}
				clickable={false}
			/>

			{/* Comments Section */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-roboto-condensed font-semibold">Comments</h2>
				</CardHeader>
				<CardContent className="space-y-6">
					<AddComment arweaveId={arweaveId} onCommentAdded={handleCommentAdded} maxLength={1000} />
					<CommentList
						arweaveId={arweaveId}
						refreshTrigger={refreshTrigger}
						showUserBadge={true}
						variant="default"
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default SinglePostPage;
