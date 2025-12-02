import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/lib/components/card";
import Loading from "@/components/Loading";
import PostCard from "./PostCard";
import useDialectica from "@/hooks/actors/useDialectica";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { Principal } from "@dfinity/principal";
import { natToArweaveId } from "@/utils/id_convert";

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

interface ProfilePostsListProps {
	userPrincipal: string;
	className?: string;
}

const ProfilePostsList: React.FC<ProfilePostsListProps> = ({
	userPrincipal,
	className = "",
}) => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { actor } = useDialectica();

	// Fetch posts from NFT collection
	const fetchPosts = async () => {
		try {
			setLoading(true);
			
			// Create NFT adapter to fetch minted posts
			const tokenAdapter = createTokenAdapter("NFT");
			
			// Fetch tokens for specific user
			const tokenIds = await tokenAdapter.getTokensOf(Principal.fromText(userPrincipal), undefined, BigInt(50));
			
			if (tokenIds.length === 0) {
				setPosts([]);
				return;
			}
			
			// Get ownership information for the tokens
			const ownershipArray = await tokenAdapter.getOwnerOf(tokenIds);
			
			// Process the posts
			const fetchedPosts: (Post | null)[] = await Promise.all(
				tokenIds.map(async (tokenId, index) => {
					try {
						// Convert token ID directly to Arweave ID
						const arweaveId = natToArweaveId(tokenId);
						
						// Get owner information
						const ownership = ownershipArray[index];
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

								const userReaction = await actor.get_user_reaction(arweaveId);
								if ('Ok' in userReaction && userReaction.Ok.length > 0) {
									const reaction = userReaction.Ok[0];
									userLiked = (reaction && typeof reaction === 'object' && 'Like' in reaction) || false;
									userDisliked = (reaction && typeof reaction === 'object' && 'Dislike' in reaction) || false;
								}
							} catch (error) {
								console.warn('Failed to fetch reaction data:', error);
							}
						}

						return {
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
					} catch (error) {
						console.warn('Failed to process token:', tokenId, error);
						return null;
					}
				})
			);

			// Filter out null entries and set posts
			setPosts(fetchedPosts.filter((post): post is Post => post !== null));
		} catch (err) {
			console.error('Error fetching posts:', err);
			setError('Failed to load posts');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPosts();
	}, [userPrincipal, actor]);

	const handleLike = async (arweaveId: string) => {
		if (!actor) return;

		try {
			const result = await actor.add_reaction(arweaveId, { 'Like': null });
			if ('Ok' in result) {
				// Update the post in the local state
				setPosts(prevPosts =>
					prevPosts.map(post =>
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
			console.error('Failed to like post:', error);
		}
	};

	const handleDislike = async (arweaveId: string) => {
		if (!actor) return;

		try {
			const result = await actor.add_reaction(arweaveId, { 'Dislike': null });
			if ('Ok' in result) {
				// Update the post in the local state
				setPosts(prevPosts =>
					prevPosts.map(post =>
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
			console.error('Failed to dislike post:', error);
		}
	};

	const handleShare = (arweaveId: string) => {
		// Copy post link to clipboard
		const postUrl = `${window.location.origin}/post/${arweaveId}`;
		navigator.clipboard.writeText(postUrl);
	};

	if (loading) {
		return (
			<div className={`flex justify-center py-8 ${className}`}>
				<Loading />
			</div>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="text-center py-12">
					<p className="text-muted-foreground">{error}</p>
					<button
						onClick={fetchPosts}
						className="mt-4 text-primary hover:underline"
					>
						Try again
					</button>
				</CardContent>
			</Card>
		);
	}

	if (posts.length === 0) {
		return (
			<Card>
				<CardContent className="text-center py-12">
					<FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
					<h3 className="text-lg font-roboto-condensed font-semibold mb-2">No Posts Yet</h3>
					<p className="text-muted-foreground">
						This user hasn't created any posts
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
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
					userLiked={post.userLiked}
					userDisliked={post.userDisliked}
					onLike={async () => await handleLike(post.arweaveId)}
					onDislike={async () => await handleDislike(post.arweaveId)}
					onShare={() => handleShare(post.arweaveId)}
				/>
			))}
		</div>
	);
};

export default ProfilePostsList;