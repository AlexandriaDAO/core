import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Clock,
	BookOpen,
	ThumbsUp,
	ThumbsDown,
	MessageCircle,
	ExternalLink,
	Loader2,
	Copy,
	Twitter,
	Facebook,
	Mail,
	Heart,
	Eye,
} from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import UsernameBadge from "@/components/UsernameBadge";
import AddComment from "@/components/Comment/post";
import CommentList from "@/components/Comment/list";
import { useAlexBackend } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import { Article, ArticleData } from "../types/article";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { arweaveIdToNat } from "@/utils/id_convert";

const ArticlePage: React.FC = () => {
	const { arweaveId } = useParams({ from: "/article/$arweaveId" });
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [likeLoading, setLikeLoading] = useState(false);
	const [dislikeLoading, setDislikeLoading] = useState(false);
	const [commentRefresh, setCommentRefresh] = useState(0);

	const { actor } = useAlexBackend();
	const { user } = useAppSelector((state) => state.auth);

	const fetchArticle = useCallback(async () => {
		if (!arweaveId) return;

		try {
			setLoading(true);
			setError(null);

			// Fetch article content from Arweave
			const response = await fetch(`https://arweave.net/${arweaveId}`);

			if (!response.ok) {
				throw new Error("Failed to fetch article");
			}

			const contentType = response.headers.get("Content-Type");
			if (!contentType?.includes("application/json")) {
				throw new Error("Invalid article format");
			}

			const articleData: ArticleData = await response.json();

			// Validate article structure
			if (!articleData.title || !articleData.content) {
				throw new Error("Invalid article data");
			}

			// Get author from NFT ownership
			let authorPrincipal = "Unknown";
			try {
				const tokenAdapter = createTokenAdapter("NFT");
				const tokenId = arweaveIdToNat(arweaveId);
				const ownershipArray = await tokenAdapter.getOwnerOf([tokenId]);
				const ownership = ownershipArray[0];
				if (ownership && ownership.length > 0 && ownership[0]) {
					authorPrincipal = ownership[0].owner.toText();
				}
			} catch (e) {
				console.warn("Failed to fetch author from NFT ownership:", e);
			}

			// Get engagement data
			let likes = 0;
			let dislikes = 0;
			let comments = 0;
			let views = 0;
			let impressions = 0;
			let userLiked = false;
			let userDisliked = false;

			if (actor) {
				try {
					// Fetch all engagement data in parallel
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

					if ("Ok" in viewsResult) {
						views = Number(viewsResult.Ok);
					}

					if ("Ok" in impressionsResult) {
						impressions = Number(impressionsResult.Ok);
					}

					if (user) {
						const userReaction = await actor.get_user_reaction(arweaveId);
						if ("Ok" in userReaction && userReaction.Ok.length > 0) {
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

					// Record this view (user opened full article)
					actor.record_view(arweaveId).then((result) => {
						if ("Ok" in result) {
							// Update the view count with the new value
							setArticle(prev => prev ? { ...prev, views: Number(result.Ok) } : null);
						}
					}).catch(() => {
						// Silently ignore view recording errors
					});
				} catch (e) {
					console.warn("Failed to fetch engagement data:", e);
				}
			}

			setArticle({
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
			});
		} catch (err: any) {
			console.error("Failed to fetch article:", err);
			setError(err.message || "Failed to load article");
		} finally {
			setLoading(false);
		}
	}, [arweaveId, actor, user]);

	useEffect(() => {
		fetchArticle();
	}, [fetchArticle]);

	const handleLike = async () => {
		if (!actor || !user || !article) return;

		setLikeLoading(true);
		try {
			const result = await actor.add_reaction(arweaveId, { Like: null });
			if ("Ok" in result) {
				setArticle((prev) =>
					prev
						? {
								...prev,
								likes: prev.userLiked ? prev.likes - 1 : prev.likes + 1,
								dislikes:
									prev.userDisliked && !prev.userLiked
										? prev.dislikes - 1
										: prev.dislikes,
								userLiked: !prev.userLiked,
								userDisliked: false,
						  }
						: null
				);
			}
		} catch (error) {
			console.error("Failed to like article:", error);
			toast.error("Failed to like article");
		} finally {
			setLikeLoading(false);
		}
	};

	const handleDislike = async () => {
		if (!actor || !user || !article) return;

		setDislikeLoading(true);
		try {
			const result = await actor.add_reaction(arweaveId, { Dislike: null });
			if ("Ok" in result) {
				setArticle((prev) =>
					prev
						? {
								...prev,
								dislikes: prev.userDisliked
									? prev.dislikes - 1
									: prev.dislikes + 1,
								likes:
									prev.userLiked && !prev.userDisliked
										? prev.likes - 1
										: prev.likes,
								userDisliked: !prev.userDisliked,
								userLiked: false,
						  }
						: null
				);
			}
		} catch (error) {
			console.error("Failed to dislike article:", error);
			toast.error("Failed to dislike article");
		} finally {
			setDislikeLoading(false);
		}
	};

	const handleShare = (platform: string) => {
		const shareUrl = `${window.location.origin}/article/${arweaveId}`;
		const shareTitle = article?.title || "Check out this article";

		let url = "";
		switch (platform) {
			case "twitter":
				url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
					shareTitle
				)}&url=${encodeURIComponent(shareUrl)}`;
				break;
			case "facebook":
				url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
					shareUrl
				)}`;
				break;
			case "email":
				window.location.href = `mailto:?subject=${encodeURIComponent(
					shareTitle
				)}&body=${encodeURIComponent(shareUrl)}`;
				return;
			case "copy":
				navigator.clipboard.writeText(shareUrl);
				toast.success("Link copied to clipboard!");
				return;
		}

		if (url) {
			window.open(url, "_blank", "width=600,height=400");
		}
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-16 flex justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error || !article) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
				<p className="text-muted-foreground mb-6">
					{error || "The article you're looking for doesn't exist."}
				</p>
				<Button asChild>
					<Link to="/">Back to Home</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Back Navigation */}
			<Button variant="ghost" className="mb-6" asChild>
				<Link to="/">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Link>
			</Button>

			{/* Article Header */}
			<header className="mb-8">
				<h1 className="text-4xl font-bold mb-4">{article.title}</h1>

				{/* Meta Info */}
				<div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
					<Link
						to="/author/$principal"
						params={{ principal: article.author }}
						className="hover:opacity-70 transition-opacity"
					>
						<UsernameBadge principal={article.author} />
					</Link>
					<span>·</span>
					<span>{formatDate(article.createdAt)}</span>
					<span>·</span>
					<span className="flex items-center gap-1">
						<Clock className="h-4 w-4" />
						{article.readTime} min read
					</span>
					<span>·</span>
					<span className="flex items-center gap-1">
						<BookOpen className="h-4 w-4" />
						{article.wordCount.toLocaleString()} words
					</span>
				</div>

				{/* Tags */}
				{article.tags && article.tags.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{article.tags.map((tag) => (
							<Link
								key={tag}
								to="/browse"
								search={{ tag }}
								className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
							>
								#{tag}
							</Link>
						))}
					</div>
				)}
			</header>

			{/* Article Content */}
			<article className="mb-8">
				<MarkdownRenderer content={article.content} className="prose-lg" />
			</article>

			{/* Engagement Actions */}
			<Card className="mb-8">
				<CardContent className="p-4">
					<div className="flex items-center justify-between flex-wrap gap-4">
						{/* Like/Dislike */}
						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								className={`gap-2 ${article.userLiked ? "text-green-500" : ""}`}
								onClick={handleLike}
								disabled={!user || likeLoading}
							>
								{likeLoading ? (
									<Loader2 className="h-5 w-5 animate-spin" />
								) : (
									<ThumbsUp
										className={`h-5 w-5 ${
											article.userLiked ? "fill-current" : ""
										}`}
									/>
								)}
								<span>{article.likes}</span>
							</Button>

							<Button
								variant="ghost"
								className={`gap-2 ${article.userDisliked ? "text-red-500" : ""}`}
								onClick={handleDislike}
								disabled={!user || dislikeLoading}
							>
								{dislikeLoading ? (
									<Loader2 className="h-5 w-5 animate-spin" />
								) : (
									<ThumbsDown
										className={`h-5 w-5 ${
											article.userDisliked ? "fill-current" : ""
										}`}
									/>
								)}
								<span>{article.dislikes}</span>
							</Button>

							<span className="flex items-center gap-2 text-muted-foreground">
								<MessageCircle className="h-5 w-5" />
								<span>{article.comments}</span>
							</span>

							<span className="flex items-center gap-2 text-muted-foreground">
								<Eye className="h-5 w-5" />
								<span>{article.views}</span>
							</span>
						</div>

						{/* Share Options */}
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								scale="sm"
								onClick={() => handleShare("copy")}
								title="Copy link"
							>
								<Copy className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								scale="sm"
								onClick={() => handleShare("twitter")}
								title="Share on Twitter"
							>
								<Twitter className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								scale="sm"
								onClick={() => handleShare("facebook")}
								title="Share on Facebook"
							>
								<Facebook className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								scale="sm"
								onClick={() => handleShare("email")}
								title="Share via Email"
							>
								<Mail className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								scale="sm"
								onClick={() =>
									window.open(`https://arweave.net/${arweaveId}`, "_blank")
								}
							>
								<ExternalLink className="h-4 w-4 mr-2" />
								View on Arweave
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Support the Author */}
			{article.author && article.author !== "Unknown" && (
				<div className="mb-8 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Heart className="h-5 w-5 text-primary" />
						<span className="text-sm">
							Enjoyed this article? Show your appreciation
						</span>
					</div>
					<Button asChild scale="sm" className="gap-2">
						<Link to="/support/$principal" params={{ principal: article.author }}>
							<Heart className="h-4 w-4" />
							Support Author
						</Link>
					</Button>
				</div>
			)}

			{/* Comments Section */}
			<Card id="comments">
				<CardContent className="p-6">
					<h3 className="text-xl font-bold mb-4 flex items-center gap-2">
						<MessageCircle className="h-5 w-5" />
						Comments
					</h3>

					<AddComment
						arweaveId={arweaveId}
						onCommentAdded={() => setCommentRefresh((prev) => prev + 1)}
						className="mb-6"
					/>

					<CommentList
						arweaveId={arweaveId}
						refreshTrigger={commentRefresh}
						variant="compact"
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default ArticlePage;
