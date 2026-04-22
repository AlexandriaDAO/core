import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import AssetModal from "@/features/nft/components/Asset/Modal";
import Preview from "@/features/nft/components/Asset/Preview";
import { NftContext } from "@/components/NftProvider";
import IcpInfo from "@/features/nft/components/Info/Icp";
import Tags from "@/features/nft/components/Info/Tags";
import Comment from "@/features/nft/components/Comment";
import SimilarNfts from "@/features/nft/components/SimilarNfts";
import useTransactionMetadata from "@/features/nft/hooks/useTransactionMetadata";
import { AlexandrianToken } from "@/features/alexandrian/types";
import { natToArweaveId, arweaveIdToNat } from "@/utils/id_convert";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { copyToClipboard, shorten, convertTimestamp } from "@/utils/general";
import { formatFileSize } from "@/features/pinax/utils";
import { useAlexBackend, useEmporium } from "@/hooks/actors";
import { useQuery } from "@tanstack/react-query";
import { trackView } from "@/services/engagementService";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/lib/components/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/lib/components/tooltip";
import { Button } from "@/lib/components/button";
import {
	Loader,
	Eye,
	TrendingUp,
	Tag,
	MessageCircle,
	History,
	Copy,
	Facebook,
	Twitter,
	AtSign,
	Mail,
} from "lucide-react";

function NftPage() {
	const { tokenId } = useParams({ from: "/nft/$tokenId" });
	const { actor } = useAlexBackend();
	const { actor: emporiumActor } = useEmporium();
	const [token, setToken] = useState<AlexandrianToken | null>(null);
	const [arweaveId, setArweaveId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("tags");

	// Fetch token data
	useEffect(() => {
		let mounted = true;
		async function loadToken() {
			if (!tokenId) return;
			setLoading(true);
			try {
				const nftId = BigInt(tokenId);
				// Scion token IDs encode an extra 64-bit principal hash and
				// come out >90 decimal digits wide. `natToArweaveId` already
				// uses this exact threshold to peel the hash back off, so
				// routing the adapter the same way keeps them consistent.
				const isScion = tokenId.length > 90;
				const collection: "NFT" | "SBT" = isScion ? "SBT" : "NFT";
				const adapter = createTokenAdapter(collection);
				const awId = natToArweaveId(nftId);

				const ownerResult = await adapter.getOwnerOf([nftId]);
				const owner = ownerResult?.[0]?.[0]?.owner?.toString() || "";
				const icpInfo = await adapter.tokenToIcpInfo(nftId);

				if (mounted) {
					setArweaveId(awId);
					setToken({
						id: tokenId,
						arweaveId: awId,
						owner,
						collection,
						...icpInfo,
					});
				}
			} catch (error) {
				console.error("Failed to load token:", error);
			} finally {
				if (mounted) setLoading(false);
			}
		}
		loadToken();
		return () => {
			mounted = false;
		};
	}, [tokenId]);

	// Track view
	useEffect(() => {
		if (arweaveId) trackView(arweaveId);
	}, [arweaveId]);

	// Arweave metadata
	const { metadata, loading: metadataLoading } = useTransactionMetadata(
		arweaveId || "",
		!!arweaveId,
	);

	// View count
	const { data: viewCount } = useQuery({
		queryKey: ["view-count", arweaveId],
		queryFn: async () => {
			if (!actor || !arweaveId) return 0;
			const result = await actor.get_view_count(arweaveId);
			return "Ok" in result ? Number(result.Ok) : 0;
		},
		enabled: !!actor && !!arweaveId,
		staleTime: 60_000,
	});

	// Impression count
	const { data: impressionCount } = useQuery({
		queryKey: ["impression-count", arweaveId],
		queryFn: async () => {
			if (!actor || !arweaveId) return 0;
			const result = await actor.get_impressions(arweaveId);
			return "Ok" in result ? Number(result.Ok) : 0;
		},
		enabled: !!actor && !!arweaveId,
		staleTime: 60_000,
	});

	// Price history
	const tokenIdBigInt = arweaveId ? arweaveIdToNat(arweaveId) : 0n;
	const { data: priceHistory, isLoading: historyLoading } = useQuery({
		queryKey: ["price-history", tokenId],
		queryFn: async () => {
			if (!emporiumActor) return [];
			const result = await emporiumActor.get_logs(
				[],
				[BigInt(100)],
				[tokenIdBigInt],
			);
			return result.logs;
		},
		enabled: !!emporiumActor && activeTab === "history",
		staleTime: 60_000,
	});

	const shareUrl =
		typeof window !== "undefined" && tokenId
			? `${window.location.origin}/nft/${tokenId}`
			: "";

	const handleShare = (platform: string) => {
		const shareTitle = `Check out NFT #${tokenId} on Alexandria`;
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
			case "email": {
				const subject = encodeURIComponent(shareTitle);
				const body = encodeURIComponent(
					`Check out this amazing NFT!\n\n${shareUrl}`,
				);
				window.location.href = `mailto:?subject=${subject}&body=${body}`;
				return;
			}
			case "copy":
				copyToClipboard(shareUrl);
				return;
			default:
				return;
		}
		if (url) window.open(url, "_blank", "width=600,height=400");
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Loader className="animate-spin h-8 w-8 text-muted-foreground" />
			</div>
		);
	}

	if (!token || !arweaveId) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				Token not found
			</div>
		);
	}

	return (
		<>
		<Helmet>
			<title>NFT #{tokenId} | Alexandria</title>
			<meta name="description" content={`View NFT #${tokenId} on Alexandria — details, comments, history, and more.`} />
		</Helmet>
		<div className="container mx-auto p-4 space-y-6">
			{/* Row 1: Asset + Info (matched height) */}
			<div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
				{/* Asset Display */}
				<div className="flex-1 min-w-0">
					<div
						className="relative bg-background rounded-lg border border-border/30 overflow-hidden h-full"
						style={{ minHeight: "50vh" }}
					>
						{viewCount || impressionCount ? (
							<div className="absolute z-10 top-4 left-4 flex items-center gap-2 text-xs text-muted-foreground">
								{viewCount !== undefined && viewCount > 0 && (
									<span className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
										<Eye size={14} />
										{viewCount}
									</span>
								)}
								{impressionCount !== undefined &&
									impressionCount > 0 && (
										<span className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
											<TrendingUp size={14} />
											{impressionCount}
										</span>
									)}
							</div>
						) : null}

						{/* Share Icons */}
						<div className="absolute z-10 top-4 right-4 flex items-center gap-2">
							<Button
								variant="outline"
								scale="icon"
								rounded="full"
								onClick={() => handleShare("twitter")}
								className="h-8 w-8 border border-ring bg-background/80 backdrop-blur-sm"
							>
								<Twitter className="w-3.5 h-3.5" />
							</Button>
							<Button
								variant="outline"
								scale="icon"
								rounded="full"
								onClick={() => handleShare("facebook")}
								className="h-8 w-8 border border-ring bg-background/80 backdrop-blur-sm"
							>
								<Facebook className="w-3.5 h-3.5" />
							</Button>
							<Button
								variant="outline"
								scale="icon"
								rounded="full"
								onClick={() => handleShare("threads")}
								className="h-8 w-8 border border-ring bg-background/80 backdrop-blur-sm"
							>
								<AtSign className="w-3.5 h-3.5" />
							</Button>
							<Button
								variant="outline"
								scale="icon"
								rounded="full"
								onClick={() => handleShare("email")}
								className="h-8 w-8 border border-ring bg-background/80 backdrop-blur-sm"
							>
								<Mail className="w-3.5 h-3.5" />
							</Button>
							<Button
								variant="outline"
								scale="icon"
								rounded="full"
								onClick={() => handleShare("copy")}
								className="h-8 w-8 border border-ring bg-background/80 backdrop-blur-sm"
							>
								<Copy className="w-3.5 h-3.5" />
							</Button>
						</div>

						<ErrorBoundary
							fallback={<Preview title="Asset failed to load" />}
						>
							<NftContext.Provider
								value={{
									safe: false,
									modal: null,
									setModal: () => {},
								}}
							>
								<AssetModal id={arweaveId} />
							</NftContext.Provider>
						</ErrorBoundary>
					</div>
				</div>

				{/* Right: ICP Info + Metadata & Tags + Share */}
				<div className="lg:w-80 xl:w-96 flex-shrink-0 flex flex-col gap-4">
					{/* ICP Info */}
					<ErrorBoundary
						fallback={
							<Preview
								title="Loading Error"
								description="ICP Info failed to load"
							/>
						}
					>
						<IcpInfo token={token} />
					</ErrorBoundary>

					{/* Arweave Metadata */}
					<div className="bg-muted dark:bg-gray-900/50 backdrop-blur-xl border border-ring rounded-lg p-4 shadow-sm">
						{metadataLoading ? (
							<div className="flex items-center justify-center py-8">
								<Loader className="animate-spin h-6 w-6 text-muted-foreground" />
							</div>
						) : (
							<div className="space-y-3">
								{metadata?.timestamp &&
									metadata.timestamp > 0 && (
										<div className="flex justify-between items-center border-b border-muted-foreground/30">
											<span className="text-sm text-muted-foreground opacity-70">
												Uploaded
											</span>
											<Tooltip delayDuration={0}>
												<TooltipTrigger asChild>
													<span className="text-xs text-muted-foreground opacity-70">
														{convertTimestamp(
															metadata.timestamp,
															"relative",
														)}
													</span>
												</TooltipTrigger>
												<TooltipContent
													side="right"
													sideOffset={8}
												>
													{convertTimestamp(
														metadata.timestamp,
														"readable",
													)}
												</TooltipContent>
											</Tooltip>
										</div>
									)}

								{metadata?.owner && (
									<div className="flex justify-between items-center border-b border-muted-foreground/30">
										<span className="text-sm text-muted-foreground opacity-70">
											By
										</span>
										<span
											className="text-xs text-muted-foreground opacity-70 cursor-copy"
											onClick={() =>
												copyToClipboard(metadata.owner)
											}
										>
											{shorten(metadata.owner, 6, 4)}
										</span>
									</div>
								)}

								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground opacity-70">
										Size
									</span>
									<span className="text-xs text-muted-foreground opacity-70">
										{formatFileSize(metadata?.size || 0)}
									</span>
								</div>
							</div>
						)}
					</div>

					{/* Tags, Comments & History Tabs */}
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto">
							<TabsTrigger
								value="tags"
								className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-2 flex items-center gap-2"
							>
								<Tag className="w-4 h-4" />
								<span className="text-sm">Tags</span>
							</TabsTrigger>
							<TabsTrigger
								value="comments"
								className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-2 flex items-center gap-2"
							>
								<MessageCircle className="w-4 h-4" />
								<span className="text-sm">Comments</span>
							</TabsTrigger>
							<TabsTrigger
								value="history"
								className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-2 flex items-center gap-2"
							>
								<History className="w-4 h-4" />
								<span className="text-sm">History</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="tags" className="mt-4">
							{metadataLoading ? (
								<div className="flex items-center justify-center py-4">
									<Loader className="animate-spin h-5 w-5 text-muted-foreground" />
								</div>
							) : (
								<div className="max-h-[22rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
									<Tags tags={metadata?.tags} />
								</div>
							)}
						</TabsContent>

						<TabsContent value="comments" className="mt-4">
							<Comment arweaveId={arweaveId} />
						</TabsContent>

						<TabsContent value="history" className="mt-4">
							{historyLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader className="animate-spin h-6 w-6 text-muted-foreground" />
								</div>
							) : !priceHistory || priceHistory.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<p className="text-sm">
										No trading history yet
									</p>
								</div>
							) : (
								<div className="space-y-2 overflow-y-auto max-h-[22rem] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
									{priceHistory.map(
										([logId, entry]: [any, any]) => {
											const action = entry.action;
											let label = "";
											let price = "";
											let color = "text-muted-foreground";

											if ("Listed" in action) {
												label = "Listed";
												price = `${(Number(action.Listed.price) / 1e8).toFixed(4)} ICP`;
												color =
													"text-blue-600 dark:text-blue-400";
											} else if ("Sold" in action) {
												label = "Sold";
												price = `${(Number(action.Sold.price) / 1e8).toFixed(4)} ICP`;
												color =
													"text-green-600 dark:text-green-400";
											} else if (
												"PriceUpdate" in action
											) {
												label = "Price Updated";
												price = `${(Number(action.PriceUpdate.old_price) / 1e8).toFixed(4)} → ${(Number(action.PriceUpdate.new_price) / 1e8).toFixed(4)} ICP`;
												color =
													"text-yellow-600 dark:text-yellow-400";
											} else if ("Removed" in action) {
												label = "Delisted";
												color =
													"text-red-600 dark:text-red-400";
											} else if (
												"ReimbursedToBuyer" in action
											) {
												label = "Reimbursed";
												color =
													"text-orange-600 dark:text-orange-400";
											}

											return (
												<div
													key={logId.toString()}
													className="rounded-lg bg-gray-200/80 dark:bg-gray-800/60 p-2.5 space-y-1"
												>
													<div className="flex items-center justify-between">
														<span
															className={`text-xs font-medium ${color}`}
														>
															{label}
														</span>
														<span className="text-xs text-muted-foreground opacity-70">
															{convertTimestamp(
																entry.timestamp,
																"relative",
															)}
														</span>
													</div>
													{price && (
														<p className="text-sm font-mono">
															{price}
														</p>
													)}
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<span>
															Seller:{" "}
															{shorten(
																entry.seller.toString(),
																4,
																4,
															)}
														</span>
														{entry.buyer.toString() !==
															entry.seller.toString() && (
															<span>
																Buyer:{" "}
																{shorten(
																	entry.buyer.toString(),
																	4,
																	4,
																)}
															</span>
														)}
													</div>
												</div>
											);
										},
									)}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</div>

			{/* Row 2: Similar NFTs */}
			<SimilarNfts arweaveId={arweaveId} />
		</div>
		</>
	);
}

export default NftPage;
