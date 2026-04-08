import React from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useNftManager, useAlexBackend } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { natToArweaveId } from "@/utils/id_convert";
import { feed } from "../../../../../declarations/feed";
import { Eye, TrendingUp, ThumbsUp, ThumbsDown, MessageCircle, Layers, Wallet } from "lucide-react";
import { Badge } from "@/lib/components/badge";
import { shorten } from "@/utils/general";

interface NftAnalytics {
	tokenId: string;
	arweaveId: string;
	views: number;
	impressions: number;
	likes: number;
	dislikes: number;
	comments: number;
	scionCount: number;
	alexBalance: number;
	lbryBalance: number;
}

function AnalyticsPage() {
	const { actor: nftManagerActor } = useNftManager();
	const { actor: alexBackendActor } = useAlexBackend();
	const { user } = useAppSelector((state) => state.auth);

	// Fetch user's NFTs with all analytics data
	const { data: analytics, isLoading } = useQuery({
		queryKey: ["creator-analytics", user?.principal],
		queryFn: async () => {
			if (!nftManagerActor || !alexBackendActor || !user) return [];

			// Step 1: Get user's NFTs
			const nftsResult = await nftManagerActor.get_nfts_of(
				(await import("@dfinity/principal")).Principal.fromText(user.principal)
			);
			if ("Err" in nftsResult) return [];

			const nfts = nftsResult.Ok;
			if (nfts.length === 0) return [];

			// Step 2: Get balances
			const tokenIds = nfts.map(([id]) => id);
			let balances: Array<{ lbry: bigint; alex: bigint }> = [];
			try {
				const balResult = await nftManagerActor.get_nft_balances(tokenIds.slice(0, 49));
				if ("Ok" in balResult) balances = balResult.Ok;
			} catch { /* balances stay empty */ }

			// Step 3: Get scion counts from feed
			let scionCounts = new Map<string, number>();
			try {
				const counts = await feed.get_sbt_counts_for_og_nfts(tokenIds);
				counts.forEach(([id, count]) => scionCounts.set(id.toString(), Number(count)));
			} catch { /* counts stay empty */ }

			// Step 4: Get engagement data per NFT
			const results: NftAnalytics[] = await Promise.all(
				nfts.map(async ([tokenId], index) => {
					const arweaveId = natToArweaveId(tokenId);
					const id = tokenId.toString();

					let views = 0, impressions = 0, likes = 0, dislikes = 0, comments = 0;
					try {
						const [viewResult, impResult, reactionResult] = await Promise.allSettled([
							alexBackendActor.get_view_count(arweaveId),
							alexBackendActor.get_impressions(arweaveId),
							alexBackendActor.get_reaction_counts(arweaveId),
						]);
						if (viewResult.status === "fulfilled" && "Ok" in viewResult.value) views = Number(viewResult.value.Ok);
						if (impResult.status === "fulfilled" && "Ok" in impResult.value) impressions = Number(impResult.value.Ok);
						if (reactionResult.status === "fulfilled" && "Ok" in reactionResult.value) {
							likes = Number(reactionResult.value.Ok.likes);
							dislikes = Number(reactionResult.value.Ok.dislikes);
							comments = Number(reactionResult.value.Ok.total_comments);
						}
					} catch { /* engagement stays 0 */ }

					const bal = balances[index];
					return {
						tokenId: id,
						arweaveId,
						views,
						impressions,
						likes,
						dislikes,
						comments,
						scionCount: scionCounts.get(id) || 0,
						alexBalance: bal ? Number(bal.alex) / 1e8 : 0,
						lbryBalance: bal ? Number(bal.lbry) / 1e8 : 0,
					};
				})
			);

			return results;
		},
		enabled: !!nftManagerActor && !!alexBackendActor && !!user,
		staleTime: 120_000,
	});

	// Aggregate stats
	const totals = analytics?.reduce(
		(acc, nft) => ({
			views: acc.views + nft.views,
			impressions: acc.impressions + nft.impressions,
			likes: acc.likes + nft.likes,
			dislikes: acc.dislikes + nft.dislikes,
			comments: acc.comments + nft.comments,
			scions: acc.scions + nft.scionCount,
			alex: acc.alex + nft.alexBalance,
			lbry: acc.lbry + nft.lbryBalance,
		}),
		{ views: 0, impressions: 0, likes: 0, dislikes: 0, comments: 0, scions: 0, alex: 0, lbry: 0 }
	) || { views: 0, impressions: 0, likes: 0, dislikes: 0, comments: 0, scions: 0, alex: 0, lbry: 0 };

	const overviewStats = [
		{ label: "Total Views", value: totals.views, icon: Eye, color: "text-blue-600 dark:text-blue-400" },
		{ label: "Total Impressions", value: totals.impressions, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400" },
		{ label: "Total Scions", value: totals.scions, icon: Layers, color: "text-purple-600 dark:text-purple-400" },
		{ label: "Total Likes", value: totals.likes, icon: ThumbsUp, color: "text-pink-600 dark:text-pink-400" },
		{ label: "Comments", value: totals.comments, icon: MessageCircle, color: "text-amber-600 dark:text-amber-400" },
		{ label: "Earnings (LBRY)", value: totals.lbry.toFixed(2), icon: Wallet, color: "text-green-600 dark:text-green-400" },
	];

	if (isLoading) {
		return (
			<div className="space-y-6">
				<h1 className="text-3xl font-bold">Creator Analytics</h1>
				<div className="flex items-center justify-center py-20">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<Helmet>
				<title>Analytics | Alexandria</title>
				<meta name="description" content="View analytics and performance metrics for your Alexandria content." />
			</Helmet>
			<div>
				<h1 className="text-3xl font-bold">Creator Analytics</h1>
				<p className="text-muted-foreground mt-1">See how your content is performing</p>
			</div>

			{/* Overview cards */}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{overviewStats.map((stat) => (
					<div key={stat.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4 space-y-2">
						<div className="flex items-center gap-2">
							<stat.icon size={16} className={stat.color} />
							<span className="text-xs text-muted-foreground">{stat.label}</span>
						</div>
						<p className="text-2xl font-bold tabular-nums">{stat.value}</p>
					</div>
				))}
			</div>

			{/* Per-NFT breakdown */}
			{analytics && analytics.length > 0 ? (
				<div className="space-y-4">
					<h2 className="text-xl font-bold">Per-NFT Breakdown</h2>
					<div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="bg-gray-100 dark:bg-gray-800/50 text-left text-xs text-muted-foreground">
										<th className="px-4 py-3 font-medium">NFT</th>
										<th className="px-4 py-3 font-medium text-center">Views</th>
										<th className="px-4 py-3 font-medium text-center">Impressions</th>
										<th className="px-4 py-3 font-medium text-center">Scions</th>
										<th className="px-4 py-3 font-medium text-center">Likes</th>
										<th className="px-4 py-3 font-medium text-center">Comments</th>
										<th className="px-4 py-3 font-medium text-right">ALEX</th>
										<th className="px-4 py-3 font-medium text-right">LBRY</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 dark:divide-gray-800">
									{analytics
										.sort((a, b) => b.views - a.views)
										.map((nft) => (
											<tr key={nft.tokenId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
												<td className="px-4 py-3">
													<span className="font-mono text-xs text-muted-foreground">
														{shorten(nft.arweaveId, 6, 4)}
													</span>
												</td>
												<td className="px-4 py-3 text-center tabular-nums">{nft.views}</td>
												<td className="px-4 py-3 text-center tabular-nums">{nft.impressions}</td>
												<td className="px-4 py-3 text-center">
													{nft.scionCount > 0 ? (
														<Badge variant="outline" className="text-xs px-1.5 py-0 bg-purple-500/10 text-purple-700 border-purple-500/30">
															{nft.scionCount}
														</Badge>
													) : (
														<span className="text-muted-foreground">0</span>
													)}
												</td>
												<td className="px-4 py-3 text-center">
													<div className="flex items-center justify-center gap-2">
														{nft.likes > 0 && (
															<span className="flex items-center gap-0.5 text-green-600">
																<ThumbsUp size={12} />{nft.likes}
															</span>
														)}
														{nft.dislikes > 0 && (
															<span className="flex items-center gap-0.5 text-red-500">
																<ThumbsDown size={12} />{nft.dislikes}
															</span>
														)}
														{nft.likes === 0 && nft.dislikes === 0 && (
															<span className="text-muted-foreground">0</span>
														)}
													</div>
												</td>
												<td className="px-4 py-3 text-center tabular-nums">{nft.comments}</td>
												<td className="px-4 py-3 text-right tabular-nums">
													{nft.alexBalance > 0 ? nft.alexBalance.toFixed(2) : "—"}
												</td>
												<td className="px-4 py-3 text-right tabular-nums">
													{nft.lbryBalance > 0 ? nft.lbryBalance.toFixed(2) : "—"}
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
					<div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
						<TrendingUp size={28} className="opacity-40" />
					</div>
					<p className="text-sm">Upload and mint your first NFT to see analytics here</p>
				</div>
			)}
		</div>
	);
}

export default AnalyticsPage;
