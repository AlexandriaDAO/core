import React, { useState, useRef, useEffect } from "react";
import {
	ThumbsUp,
	ThumbsDown,
	MessageCircle,
	Share2,
	Clock,
	BookOpen,
	MoreVertical,
	Loader2,
	Twitter,
	Facebook,
	Mail,
	AtSign,
	Copy,
	X,
	TrendingUp,
} from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";
import { Link, useRouter } from "@tanstack/react-router";
import UsernameBadge from "@/components/UsernameBadge";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/lib/components/tooltip";
import { toast } from "sonner";
import { Article } from "../types/article";

interface ArticleCardProps {
	article: Article;
	onLike?: () => Promise<void>;
	onDislike?: () => Promise<void>;
	onTagClick?: (tag: string) => void;
	clickable?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
	article,
	onLike,
	onDislike,
	onTagClick,
	clickable = true,
}) => {
	const [likeLoading, setLikeLoading] = useState(false);
	const [dislikeLoading, setDislikeLoading] = useState(false);
	const [showSharePanel, setShowSharePanel] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const sharePanelRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const { user } = useAppSelector((state) => state.auth);

	// Close share panel when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				sharePanelRef.current &&
				!sharePanelRef.current.contains(event.target as Node)
			) {
				closeSharePanel();
			}
		};

		if (showSharePanel) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showSharePanel]);

	const closeSharePanel = () => {
		setIsClosing(true);
		setTimeout(() => {
			setShowSharePanel(false);
			setIsClosing(false);
		}, 200);
	};

	const handleShareClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (showSharePanel) {
			closeSharePanel();
		} else {
			setShowSharePanel(true);
		}
	};

	const shareUrl = `${window.location.origin}/article/${article.arweaveId}`;
	const shareTitle = `${article.title} - Syllogos`;

	const handleShare = (platform: string) => {
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
			case "threads":
				url = `https://www.threads.net/intent/post?text=${encodeURIComponent(
					shareTitle + " " + shareUrl
				)}`;
				break;
			case "email":
				const subject = encodeURIComponent(shareTitle);
				const body = encodeURIComponent(
					`Check out this article!\n\n${article.excerpt}\n\n${shareUrl}`
				);
				window.location.href = `mailto:?subject=${subject}&body=${body}`;
				closeSharePanel();
				return;
			case "copy":
				navigator.clipboard.writeText(shareUrl);
				toast.success("Link copied to clipboard!");
				closeSharePanel();
				return;
			default:
				return;
		}

		if (url) {
			window.open(url, "_blank", "width=600,height=400");
		}
		closeSharePanel();
	};

	const handleCardClick = (e: React.MouseEvent) => {
		// Don't navigate if clicking on interactive elements
		const target = e.target as HTMLElement;
		if (target.closest("button") || target.closest("a") || !clickable) {
			return;
		}
		router.navigate({ to: `/article/${article.arweaveId}` });
	};

	const handleLike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!user || !onLike) return;
		setLikeLoading(true);
		try {
			await onLike();
		} finally {
			setLikeLoading(false);
		}
	};

	const handleDislike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!user || !onDislike) return;
		setDislikeLoading(true);
		try {
			await onDislike();
		} finally {
			setDislikeLoading(false);
		}
	};

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
		});
	};

	return (
		<Card
			className={`w-full ${
				clickable
					? "cursor-pointer hover:shadow-lg transition-shadow duration-200"
					: ""
			}`}
			onClick={handleCardClick}
		>
			<CardContent className="p-4 flex flex-col gap-4">
				{/* Top Row: Author/Date on left, Stats/Menu on right */}
				<div className="flex items-center justify-between">
					{/* Author and Date */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Link
							to="/author/$principal"
							params={{ principal: article.author }}
							className="hover:opacity-70 transition-opacity"
							onClick={(e) => e.stopPropagation()}
						>
							<UsernameBadge principal={article.author} />
						</Link>
						<span>·</span>
						<span>{formatDate(article.createdAt)}</span>
					</div>

					{/* Stats and Menu */}
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						{article.impressions > 0 && (
							<span className="flex items-center gap-1">
								<TrendingUp className="h-3.5 w-3.5" />
								{article.impressions.toLocaleString()}
							</span>
						)}
						<span className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5" />
							{article.readTime}m
						</span>
						<span className="flex items-center gap-1">
							<BookOpen className="h-3.5 w-3.5" />
							{article.wordCount.toLocaleString()}
						</span>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									className="p-1 rounded hover:bg-muted transition-colors"
									onClick={(e) => e.stopPropagation()}
								>
									<MoreVertical className="h-4 w-4" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => handleShare("copy")}>
									Copy link
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										window.open(
											`https://arweave.net/${article.arweaveId}`,
											"_blank"
										)
									}
								>
									View on Arweave
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Center Content: Title, Excerpt, Tags */}
				<div className="flex flex-col gap-1.5">
					<h3 className="text-lg font-bold line-clamp-2 hover:text-primary transition-colors">
						{article.title}
					</h3>
					<p className="text-muted-foreground line-clamp-2 text-sm">{article.excerpt}</p>
					{article.tags && article.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5 mt-0.5">
							{article.tags.map((tag) => (
								<button
									key={tag}
									onClick={(e) => {
										e.stopPropagation();
										onTagClick?.(tag);
									}}
									className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
								>
									#{tag}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Actions Row - Compact Icons */}
				<div className="flex items-center justify-between">
					{/* Left: Like, Dislike, Comments */}
					<div className="flex items-center gap-1">
						{/* Like */}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${
											article.userLiked
												? "text-green-500"
												: "text-muted-foreground hover:text-primary hover:bg-primary/10"
										} ${(!user || likeLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
										onClick={handleLike}
										disabled={!user || likeLoading}
									>
										{likeLoading ? (
											<Loader2 className="h-5 w-5 animate-spin" />
										) : (
											<ThumbsUp
												className={`h-5 w-5 ${article.userLiked ? "fill-current" : ""}`}
											/>
										)}
										{article.likes > 0 && (
											<span className="text-sm font-medium">{article.likes}</span>
										)}
									</button>
								</TooltipTrigger>
								{!user && (
									<TooltipContent>
										<p>Sign in to like</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>

						{/* Dislike */}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${
											article.userDisliked
												? "text-red-500"
												: "text-muted-foreground hover:text-primary hover:bg-primary/10"
										} ${(!user || dislikeLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
										onClick={handleDislike}
										disabled={!user || dislikeLoading}
									>
										{dislikeLoading ? (
											<Loader2 className="h-5 w-5 animate-spin" />
										) : (
											<ThumbsDown
												className={`h-5 w-5 ${article.userDisliked ? "fill-current" : ""}`}
											/>
										)}
										{article.dislikes > 0 && (
											<span className="text-sm font-medium">{article.dislikes}</span>
										)}
									</button>
								</TooltipTrigger>
								{!user && (
									<TooltipContent>
										<p>Sign in to dislike</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>

						{/* Comments */}
						<button
							className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								router.navigate({ to: `/article/${article.arweaveId}#comments` });
							}}
						>
							<MessageCircle className="h-5 w-5" />
							{article.comments > 0 && (
								<span className="text-sm font-medium">{article.comments}</span>
							)}
						</button>
					</div>

					{/* Right: Share */}
					<div className="relative flex items-center" ref={sharePanelRef}>
						{showSharePanel && (
							<div
								className={`flex items-center gap-0.5 mr-1 ${
									isClosing
										? "animate-slide-out-right"
										: "animate-slide-in-left"
								}`}
							>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
												onClick={(e) => {
													e.stopPropagation();
													handleShare("copy");
												}}
											>
												<Copy className="h-4 w-4" />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Copy link</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
												onClick={(e) => {
													e.stopPropagation();
													handleShare("twitter");
												}}
											>
												<Twitter className="h-4 w-4" />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Share on Twitter</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
												onClick={(e) => {
													e.stopPropagation();
													handleShare("facebook");
												}}
											>
												<Facebook className="h-4 w-4" />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Share on Facebook</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
												onClick={(e) => {
													e.stopPropagation();
													handleShare("email");
												}}
											>
												<Mail className="h-4 w-4" />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Share via Email</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						)}

						<button
							className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${
								showSharePanel
									? "text-primary bg-primary/10"
									: "text-muted-foreground hover:text-primary hover:bg-primary/10"
							}`}
							onClick={handleShareClick}
						>
							{showSharePanel ? (
								<X className="h-5 w-5" />
							) : (
								<Share2 className="h-5 w-5" />
							)}
						</button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ArticleCard;
