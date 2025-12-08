import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
	User,
	Heart,
	FileText,
	ThumbsUp,
	Eye,
	PenSquare,
	Calendar,
	Copy,
	Check,
} from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";
import UsernameBadge from "@/components/UsernameBadge";
import { toast } from "sonner";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { natToArweaveId } from "@/utils/id_convert";
import { ARWEAVE_GRAPHQL_ENDPOINT } from "@/features/permasearch/utils/helpers";
import { useAlexBackend } from "@/hooks/actors";

const APPLICATION_NAME = "Syllogos";

interface AuthorStats {
	articleCount: number;
	totalLikes: number;
	totalViews: number;
	lastActivity: number | null;
}

interface AuthorProfileCardProps {
	principal: string;
	isOwnProfile?: boolean;
}

const AuthorProfileCard: React.FC<AuthorProfileCardProps> = ({
	principal,
	isOwnProfile = false,
}) => {
	const [stats, setStats] = useState<AuthorStats>({
		articleCount: 0,
		totalLikes: 0,
		totalViews: 0,
		lastActivity: null,
	});
	const [loading, setLoading] = useState(true);
	const [copied, setCopied] = useState(false);
	const { actor } = useAlexBackend();

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);

				// Get all NFTs
				const tokenAdapter = createTokenAdapter("NFT");
				const totalSupply = await tokenAdapter.getTotalSupply();
				if (totalSupply === 0n) {
					setLoading(false);
					return;
				}

				const allTokenIds = await tokenAdapter.getTokens(0n, totalSupply);
				const allArweaveIds = allTokenIds.map(natToArweaveId);

				// Filter for Syllogos articles
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
						variables: { ids: allArweaveIds },
					}),
				});

				if (!response.ok) {
					setLoading(false);
					return;
				}

				const data = await response.json();
				const syllogosIds = new Set(
					data?.data?.transactions?.edges?.map((e: any) => e.node.id) || []
				);

				// Get ownership for all tokens and filter by this author
				const ownershipArray = await tokenAdapter.getOwnerOf(allTokenIds);
				const authorArticleIds: string[] = [];

				allTokenIds.forEach((tokenId, index) => {
					const arweaveId = natToArweaveId(tokenId);
					if (!syllogosIds.has(arweaveId)) return;

					const ownership = ownershipArray[index];
					if (ownership && ownership.length > 0 && ownership[0]) {
						const owner = ownership[0].owner.toText();
						if (owner === principal) {
							authorArticleIds.push(arweaveId);
						}
					}
				});

				// Fetch engagement stats for author's articles
				let totalLikes = 0;
				let totalViews = 0;
				let lastActivity: number | null = null;

				if (actor && authorArticleIds.length > 0) {
					const statsPromises = authorArticleIds.map(async (arweaveId) => {
						try {
							const [reactionCounts, viewCount] = await Promise.all([
								actor.get_reaction_counts(arweaveId),
								actor.get_view_count(arweaveId),
							]);

							let likes = 0;
							let views = 0;

							if ("Ok" in reactionCounts) {
								likes = Number(reactionCounts.Ok.likes);
							}
							if ("Ok" in viewCount) {
								views = Number(viewCount.Ok);
							}

							// Fetch article to get createdAt
							const contentResponse = await fetch(`https://arweave.net/${arweaveId}`);
							const articleData = await contentResponse.json();
							const createdAt = articleData?.createdAt || null;

							return { likes, views, createdAt };
						} catch {
							return { likes: 0, views: 0, createdAt: null };
						}
					});

					const results = await Promise.all(statsPromises);
					results.forEach((result) => {
						totalLikes += result.likes;
						totalViews += result.views;
						if (result.createdAt && (!lastActivity || result.createdAt > lastActivity)) {
							lastActivity = result.createdAt;
						}
					});
				}

				setStats({
					articleCount: authorArticleIds.length,
					totalLikes,
					totalViews,
					lastActivity,
				});
			} catch (error) {
				console.error("Failed to fetch author stats:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, [principal, actor]);

	const handleCopyPrincipal = async () => {
		try {
			await navigator.clipboard.writeText(principal);
			setCopied(true);
			toast.success("Principal copied!");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<Card>
			<CardContent className="p-5">
				<div className="flex flex-col sm:flex-row gap-4">
					{/* Avatar & Name */}
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
							<User className="h-7 w-7 text-primary" />
						</div>
						<div className="min-w-0">
							<div className="w-fit">
								<UsernameBadge principal={principal} />
							</div>
							<button
								onClick={handleCopyPrincipal}
								className="flex items-center gap-1 text-xs text-muted-foreground font-mono mt-0.5 hover:text-foreground transition-colors"
							>
								<span className="truncate max-w-[180px]">{principal}</span>
								{copied ? (
									<Check className="h-3 w-3 text-green-500 shrink-0" />
								) : (
									<Copy className="h-3 w-3 shrink-0" />
								)}
							</button>
						</div>
					</div>

					{/* Stats */}
					<div className="flex items-center gap-4 sm:gap-6 text-center">
						<div>
							<div className="flex items-center justify-center gap-1 text-lg font-semibold">
								<FileText className="h-4 w-4 text-muted-foreground" />
								{loading ? "-" : stats.articleCount}
							</div>
							<p className="text-xs text-muted-foreground">Articles</p>
						</div>
						<div>
							<div className="flex items-center justify-center gap-1 text-lg font-semibold">
								<ThumbsUp className="h-4 w-4 text-muted-foreground" />
								{loading ? "-" : stats.totalLikes}
							</div>
							<p className="text-xs text-muted-foreground">Likes</p>
						</div>
						<div>
							<div className="flex items-center justify-center gap-1 text-lg font-semibold">
								<Eye className="h-4 w-4 text-muted-foreground" />
								{loading ? "-" : stats.totalViews}
							</div>
							<p className="text-xs text-muted-foreground">Views</p>
						</div>
					</div>

					{/* Action Button */}
					<div className="flex items-center">
						{isOwnProfile ? (
							<Button asChild className="gap-2 w-full sm:w-auto">
								<Link to="/write">
									<PenSquare className="h-4 w-4" />
									Write
								</Link>
							</Button>
						) : (
							<Button asChild className="gap-2 w-full sm:w-auto">
								<Link to="/support/$principal" params={{ principal }}>
									<Heart className="h-4 w-4" />
									Support
								</Link>
							</Button>
						)}
					</div>
				</div>

				{/* Last Activity */}
				{stats.lastActivity && (
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 pt-3 border-t">
						<Calendar className="h-3.5 w-3.5" />
						Last published: {formatDate(stats.lastActivity)}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default AuthorProfileCard;
