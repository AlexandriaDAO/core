import React, { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, Copy, AlertCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent, CardHeader } from "@/lib/components/card";
import { useParams, useRouter } from "@tanstack/react-router";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { natToArweaveId } from "@/utils/id_convert";
import PostCard from "../components/PostCard";
import useDialectica from "@/hooks/actors/useDialectica";
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
	const { actor } = useDialectica();
	const { user } = useAppSelector((state) => state.auth);

	const fetchPost = async () => {
		try {
			setLoading(true);
			setError(null);

			// Create NFT adapter to search for the post by arweave ID
			const tokenAdapter = createTokenAdapter("NFT");
			const totalSupply = await tokenAdapter.getTotalSupply();

			if (totalSupply === 0n) {
				setError("Post not found");
				return;
			}

			// Search through tokens to find the one that matches this arweave ID
			let foundPost: Post | null = null;
			const batchSize = 50;

			for (let start = 0; start < Number(totalSupply); start += batchSize) {
				const end = Math.min(start + batchSize, Number(totalSupply));
				const tokenIds = await tokenAdapter.getTokens(BigInt(start), BigInt(end - start));
				
				for (const tokenId of tokenIds) {
					const tokenArweaveId = natToArweaveId(tokenId);
					
					if (tokenArweaveId === arweaveId) {
						// Found the matching token, get its details
						const ownershipArray = await tokenAdapter.getOwnerOf([tokenId]);
						const ownership = ownershipArray[0];
						const owner = ownership && ownership.length > 0 ? ownership[0] : null;
						const authorPrincipal = owner ? owner.owner.toText() : 'Unknown';

						// Try to determine content type by fetching headers
						let contentType = 'application/octet-stream';
						try {
							const headResponse = await fetch(`https://arweave.net/${arweaveId}`, { method: 'HEAD' });
							const fetchedContentType = headResponse.headers.get('Content-Type');
							if (fetchedContentType) {
								contentType = fetchedContentType;
							}
						} catch {
							contentType = 'text/plain';
						}

						// Get content for text posts
						let content = '';
						if (contentType === 'text/plain' || contentType.startsWith('text/')) {
							try {
								const contentResponse = await fetch(`https://arweave.net/${arweaveId}`);
								content = await contentResponse.text();
							} catch {
								content = '';
							}
						}

						// Get reaction counts and user reaction
						let likes = 0;
						let dislikes = 0;
						let comments = 0;
						let userLiked = false;
						let userDisliked = false;

						if (actor) {
							try {
								const reactionCounts = await actor.get_reaction_counts(arweaveId);
								if ('Ok' in reactionCounts) {
									likes = Number(reactionCounts.Ok.likes);
									dislikes = Number(reactionCounts.Ok.dislikes || 0);
									comments = Number(reactionCounts.Ok.total_comments);
								}

								if (user) {
									const userReaction = await actor.get_user_reaction(arweaveId);
									if ('Ok' in userReaction && userReaction.Ok.length > 0) {
										const reaction = userReaction.Ok[0];
										userLiked = (reaction && typeof reaction === 'object' && 'Like' in reaction) || false;
										userDisliked = (reaction && typeof reaction === 'object' && 'Dislike' in reaction) || false;
									}
								}
							} catch (error) {
								console.warn('Failed to fetch reaction data:', error);
							}
						}

						foundPost = {
							arweaveId,
							author: authorPrincipal,
							timestamp: Date.now().toString(),
							content: content || undefined,
							mediaType: contentType !== 'text/plain' && !contentType.startsWith('text/') ? contentType : undefined,
							mediaUrl: contentType !== 'text/plain' && !contentType.startsWith('text/') ? `https://arweave.net/${arweaveId}` : undefined,
							likes,
							dislikes,
							comments,
							userLiked,
							userDisliked,
						};
						break;
					}
				}

				if (foundPost) break;
			}

			if (foundPost) {
				setPost(foundPost);
			} else {
				setError("Post not found");
			}
		} catch (err) {
			console.error('Error fetching post:', err);
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
			const result = await actor.add_reaction(arweaveId, { 'Like': null });
			if ('Ok' in result) {
				setPost(prev => prev ? {
					...prev,
					likes: prev.userLiked ? prev.likes - 1 : prev.likes + 1,
					dislikes: prev.userDisliked && !prev.userLiked ? prev.dislikes - 1 : prev.dislikes,
					userLiked: !prev.userLiked,
					userDisliked: false,
				} : null);
			}
		} catch (error) {
			console.error('Failed to like post:', error);
		}
	};

	const handleDislike = async () => {
		if (!actor || !user || !post) return;

		try {
			const result = await actor.add_reaction(arweaveId, { 'Dislike': null });
			if ('Ok' in result) {
				setPost(prev => prev ? {
					...prev,
					dislikes: prev.userDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
					likes: prev.userLiked && !prev.userDisliked ? prev.likes - 1 : prev.likes,
					userDisliked: !prev.userDisliked,
					userLiked: false,
				} : null);
			}
		} catch (error) {
			console.error('Failed to dislike post:', error);
		}
	};

	const handleShare = () => {
		const postUrl = window.location.href;
		navigator.clipboard.writeText(postUrl);
		toast.success("Post link copied to clipboard!");
	};

	const handleCopyArweaveId = () => {
		navigator.clipboard.writeText(arweaveId);
		toast.success("Arweave ID copied to clipboard!");
	};

	const handleViewOnArweave = () => {
		window.open(`https://arweave.net/${arweaveId}`, '_blank');
	};

	const handleGoBack = () => {
		router.history.back();
	};

	const handleCommentAdded = () => {
		// Refresh comment count
		setRefreshTrigger(prev => prev + 1);
		if (post) {
			setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
		}
	};

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto py-12">
				<div className="flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
				userLiked={post.userLiked}
				userDisliked={post.userDisliked}
				onLike={handleLike}
				onDislike={handleDislike}
				onShare={handleShare}
				clickable={false}
			/>

			{/* Comments Section */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-roboto-condensed font-semibold">Comments</h2>
				</CardHeader>
				<CardContent className="space-y-6">
					<AddComment 
						arweaveId={arweaveId} 
						onCommentAdded={handleCommentAdded}
						maxLength={1000}
					/>
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