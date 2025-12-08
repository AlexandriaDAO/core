import React, { useState, useRef, useEffect } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical, ChevronDown, ChevronUp, Loader2, Twitter, Facebook, Mail, AtSign, Copy, X, TrendingUp } from "lucide-react";
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
import { convertTimestamp, shorten } from "@/utils/general";
import CommentsSection from "./CommentsSection";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/lib/components/tooltip";
import { toast } from "sonner";

interface PostCardProps {
	arweaveId: string;
	author: string;
	timestamp: string;
	content?: string;
	mediaType?: string;
	mediaUrl?: string;
	likes?: number;
	dislikes?: number;
	comments?: number;
	impressions?: number;
	userLiked?: boolean;
	userDisliked?: boolean;
	onLike?: () => Promise<void>;
	onDislike?: () => Promise<void>;
	onShare?: () => void;
	clickable?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
	arweaveId,
	author,
	timestamp,
	content,
	mediaType,
	mediaUrl,
	likes = 0,
	dislikes = 0,
	comments = 0,
	impressions = 0,
	userLiked = false,
	userDisliked = false,
	onLike,
	onDislike,
	onShare,
	clickable = true,
}) => {
	const [showComments, setShowComments] = useState(false);
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
			if (sharePanelRef.current && !sharePanelRef.current.contains(event.target as Node)) {
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

	const handleShareClick = () => {
		if (showSharePanel) {
			closeSharePanel();
		} else {
			setShowSharePanel(true);
		}
	};

	const shareUrl = `${window.location.origin}/post/${arweaveId}`;
	const shareTitle = `Check out this post on Dialectica`;

	const handleShare = (platform: string) => {
		let url = "";
		switch (platform) {
			case "twitter":
				url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
				break;
			case "facebook":
				url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
				break;
			case "threads":
				url = `https://www.threads.net/intent/post?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`;
				break;
			case "email":
				const subject = encodeURIComponent(shareTitle);
				const body = encodeURIComponent(`Check out this post!\n\n${shareUrl}`);
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
		if (target.closest('button') || target.closest('a') || !clickable) {
			return;
		}
		router.navigate({ to: `/post/${arweaveId}` });
	};

	const handleLike = async () => {
		if (!user || !onLike) return;
		setLikeLoading(true);
		try {
			await onLike();
		} finally {
			setLikeLoading(false);
		}
	};

	const handleDislike = async () => {
		if (!user || !onDislike) return;
		setDislikeLoading(true);
		try {
			await onDislike();
		} finally {
			setDislikeLoading(false);
		}
	};

	const formatTimestamp = (timestamp: string) => {
		try {
			const ts = parseInt(timestamp);
			// Timestamp is in milliseconds
			const date = new Date(ts);
			const now = new Date();
			const diffMs = now.getTime() - date.getTime();
			const diffMinutes = Math.floor(diffMs / (1000 * 60));
			const diffHours = Math.floor(diffMinutes / 60);
			const diffDays = Math.floor(diffHours / 24);

			if (diffMinutes < 1) return "now";
			if (diffMinutes < 60) return `${diffMinutes}m`;
			if (diffHours < 24) return `${diffHours}h`;
			if (diffDays < 7) return `${diffDays}d`;
			return date.toLocaleDateString();
		} catch {
			return "unknown";
		}
	};

	const renderMedia = () => {
		if (!mediaUrl || !mediaType) return null;

		if (mediaType.startsWith("image/")) {
			return (
				<img
					src={mediaUrl}
					alt="Post media"
					className="w-full max-h-96 object-cover rounded-lg"
				/>
			);
		}

		if (mediaType.startsWith("video/")) {
			return (
				<video
					src={mediaUrl}
					controls
					className="w-full max-h-96 rounded-lg"
					preload="metadata"
				/>
			);
		}

		if (mediaType.startsWith("audio/")) {
			return (
				<audio
					src={mediaUrl}
					controls
					className="w-full"
					preload="metadata"
				/>
			);
		}

		// For other file types, show a download link
		return (
			<div className="flex items-center gap-2 p-3 border rounded-lg bg-muted">
				<div className="flex-1">
					<p className="text-sm font-medium">Attachment</p>
					<p className="text-xs text-muted-foreground">
						{mediaType} • {shorten(arweaveId, 8)}
					</p>
				</div>
				<Button variant="outline" scale="sm" asChild>
					<a href={mediaUrl} target="_blank" rel="noopener noreferrer">
						View
					</a>
				</Button>
			</div>
		);
	};

	return (
		<Card 
			className={`w-full ${clickable ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}`}
			onClick={handleCardClick}
		>
			<CardContent className="p-4 space-y-3">
				{/* Post Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Link 
							to="/profile/$principal" 
							params={{ principal: author }}
							className="hover:opacity-70 transition-opacity"
						>
							<UsernameBadge principal={author} />
						</Link>
						<span className="text-sm text-muted-foreground">
							{formatTimestamp(timestamp)}
						</span>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" scale="sm">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Copy link</DropdownMenuItem>
							<DropdownMenuItem>Report</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Post Content */}
				{content && (
					<div className="text-sm whitespace-pre-wrap">
						{content}
					</div>
				)}

				{/* Media Content */}
				{renderMedia()}

				{/* Post Actions */}
				<div className="flex items-center justify-between pt-2 border-t">
					<div className="flex items-center gap-4">
						{/* Like Button */}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										scale="sm"
										className={`gap-2 ${
											userLiked ? "text-green-500" : ""
										}`}
										onClick={handleLike}
										disabled={!user || likeLoading}
									>
										{likeLoading ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<ThumbsUp
												className={`h-4 w-4 ${
													userLiked ? "fill-current" : ""
												}`}
											/>
										)}
										{likes > 0 && <span>{likes}</span>}
									</Button>
								</TooltipTrigger>
								{!user && (
									<TooltipContent>
										<p>Sign in to like posts</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>

						{/* Dislike Button */}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										scale="sm"
										className={`gap-2 ${
											userDisliked ? "text-red-500" : ""
										}`}
										onClick={handleDislike}
										disabled={!user || dislikeLoading}
									>
										{dislikeLoading ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<ThumbsDown
												className={`h-4 w-4 ${
													userDisliked ? "fill-current" : ""
												}`}
											/>
										)}
										{dislikes > 0 && <span>{dislikes}</span>}
									</Button>
								</TooltipTrigger>
								{!user && (
									<TooltipContent>
										<p>Sign in to dislike posts</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>

						{/* Comments Button */}
						<Button
							variant="ghost"
							scale="sm"
							className="gap-2"
							onClick={() => setShowComments(!showComments)}
						>
							<MessageCircle className="h-4 w-4" />
							{comments > 0 && <span>{comments}</span>}
							{showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
						</Button>

						{/* Impressions */}
						{impressions > 0 && (
							<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
								<TrendingUp className="h-4 w-4" />
								{impressions.toLocaleString()}
							</span>
						)}
					</div>

					{/* Share Button with Slide-out Panel */}
					<div className="relative flex items-center overflow-hidden" ref={sharePanelRef}>
						{/* Share Icons Panel - slides out to the left */}
						{showSharePanel && (
							<div className={`flex items-center gap-1 mr-2 ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-left'}`}>
									<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												scale="sm"
												className="h-8 w-8 p-0"
												onClick={() => handleShare("copy")}
											>
												<Copy className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Copy link</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												scale="sm"
												className="h-8 w-8 p-0"
												onClick={() => handleShare("twitter")}
											>
												<Twitter className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Share on Twitter</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												scale="sm"
												className="h-8 w-8 p-0"
												onClick={() => handleShare("facebook")}
											>
												<Facebook className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Share on Facebook</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												scale="sm"
												className="h-8 w-8 p-0"
												onClick={() => handleShare("threads")}
											>
												<AtSign className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Share on Threads</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											scale="sm"
											className="h-8 w-8 p-0"
											onClick={() => handleShare("email")}
										>
											<Mail className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Share via Email</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							</div>
						)}

						{/* Main Share Button */}
						<Button
							variant="ghost"
							scale="sm"
							className={`gap-2 ${showSharePanel ? 'text-primary' : ''}`}
							onClick={handleShareClick}
						>
							{showSharePanel ? <X className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
						</Button>
					</div>
				</div>

				{/* Comments Section */}
				{showComments && (
					<div className="pt-4 border-t bg-muted/20 rounded-lg p-4">
						<CommentsSection arweaveId={arweaveId} />
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default PostCard;