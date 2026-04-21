import React, { useState } from "react";

import useTransactionMetadata from "../../hooks/useTransactionMetadata";
import Tags from "./Tags";
import Comment from "../Comment";
import { copyToClipboard, shorten, convertTimestamp } from "@/utils/general";
import { formatFileSize } from "@/features/pinax/utils";
import { arweaveIdToNat } from "@/utils/id_convert";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/lib/components/tooltip";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/lib/components/tabs";
import {
	Share2,
	Copy,
	Facebook,
	Twitter,
	MessageCircle,
	Tag,
	Mail,
	AtSign,
	History,
} from "lucide-react";
import { Button } from "@/lib/components/button";
import { toast } from "sonner";
import { useEmporium } from "@/hooks/actors";
import { useQuery } from "@tanstack/react-query";

interface ArweaveInfoProps {
	// arweave id
	id: string;
}

const ArweaveInfo: React.FC<ArweaveInfoProps> = ({ id }) => {
	const { metadata, loading: metadataLoading } = useTransactionMetadata(id);
	const { actor: emporiumActor } = useEmporium();
	const [activeTab, setActiveTab] = useState("tags");

	// Convert Arweave ID to token ID
	const tokenId = arweaveIdToNat(id).toString();
	const tokenIdBigInt = arweaveIdToNat(id);

	const { data: priceHistory, isLoading: historyLoading } = useQuery({
		queryKey: ['price-history', tokenId],
		queryFn: async () => {
			if (!emporiumActor) return [];
			const result = await emporiumActor.get_logs([], [BigInt(100)], [tokenIdBigInt]);
			return result.logs;
		},
		enabled: !!emporiumActor && activeTab === "history",
		staleTime: 60_000,
	});
	const shareUrl = `${window.location.origin}/nft/${tokenId}`;

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
			case "email":
				const subject = encodeURIComponent(shareTitle);
				const body = encodeURIComponent(`Check out this amazing NFT!\n\n${shareUrl}`);
				window.location.href = `mailto:?subject=${subject}&body=${body}`;
				return;
			case "copy":
				copyToClipboard(shareUrl);
				return;
			default:
				return;
		}

		if (url) {
			window.open(url, "_blank", "width=600,height=400");
		}
	};

	return (
		<>
			<div className="space-y-1">
				{/* Upload timestamp row */}
				{metadata?.timestamp && metadata.timestamp > 0 && (
					<div className="flex justify-between items-center border-b border-muted-foreground/30 dark:border-muted-foreground/50">
						<span className="text-sm text-muted-foreground opacity-70">
							Uploaded
						</span>
						<Tooltip delayDuration={0}>
							<TooltipTrigger asChild>
								<span className="text-xs text-muted-foreground opacity-70">
									{convertTimestamp(
										metadata.timestamp,
										"relative"
									)}
								</span>
							</TooltipTrigger>
							<TooltipContent side="right" sideOffset={8}>
								{convertTimestamp(
									metadata.timestamp,
									"readable"
								)}
							</TooltipContent>
						</Tooltip>
					</div>
				)}

				{/* Owner row */}
				{metadata?.owner && (
					<div className="flex justify-between items-center border-b border-muted-foreground/30 dark:border-muted-foreground/50">
						<span className="text-sm text-muted-foreground opacity-70">
							By
						</span>
						<span
							className="text-xs text-muted-foreground opacity-70 cursor-copy"
							onClick={() => copyToClipboard(metadata.owner)}
						>
							{shorten(metadata.owner, 6, 4)}
						</span>
					</div>
				)}

				{/* Size row */}
				<div className="flex justify-between items-center">
					<span className="text-sm text-muted-foreground opacity-70">
						Size
					</span>
					<span className="text-xs text-muted-foreground opacity-70">
						{formatFileSize(metadata?.size || 0)}
					</span>
				</div>
			</div>

			{/* Tabs Section */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full mt-4"
			>
				<TabsList className="grid w-full grid-cols-4 bg-transparent p-0 h-auto">
					<TabsTrigger
						value="tags"
						aria-label="Tags"
						className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-2"
					>
						<Tag className="w-5 h-5" />
					</TabsTrigger>
					<TabsTrigger
						value="comments"
						aria-label="Comments"
						className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-2"
					>
						<MessageCircle className="w-5 h-5" />
					</TabsTrigger>
					<TabsTrigger
						value="history"
						aria-label="History"
						className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-2"
					>
						<History className="w-5 h-5" />
					</TabsTrigger>
					<TabsTrigger
						value="share"
						aria-label="Share"
						className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-2"
					>
						<Share2 className="w-5 h-5" />
					</TabsTrigger>
				</TabsList>

				<TabsContent value="tags" className="mt-4">
					{metadataLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-muted-foreground"></div>
						</div>
					) : (
						<Tags tags={metadata?.tags} />
					)}
				</TabsContent>

				<TabsContent value="comments" className="mt-4">
					<Comment arweaveId={id} />
				</TabsContent>

				<TabsContent value="history" className="mt-4">
					{historyLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-muted-foreground"></div>
						</div>
					) : !priceHistory || priceHistory.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<p className="text-sm">No trading history yet</p>
						</div>
					) : (
						<div className="space-y-2 overflow-y-auto max-h-64 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
							{priceHistory.map(([logId, entry]) => {
								const action = entry.action;
								let label = "";
								let price = "";
								let color = "text-muted-foreground";

								if ("Listed" in action) {
									label = "Listed";
									price = `${(Number(action.Listed.price) / 1e8).toFixed(4)} ICP`;
									color = "text-blue-600 dark:text-blue-400";
								} else if ("Sold" in action) {
									label = "Sold";
									price = `${(Number(action.Sold.price) / 1e8).toFixed(4)} ICP`;
									color = "text-green-600 dark:text-green-400";
								} else if ("PriceUpdate" in action) {
									label = "Price Updated";
									price = `${(Number(action.PriceUpdate.old_price) / 1e8).toFixed(4)} → ${(Number(action.PriceUpdate.new_price) / 1e8).toFixed(4)} ICP`;
									color = "text-yellow-600 dark:text-yellow-400";
								} else if ("Removed" in action) {
									label = "Delisted";
									color = "text-red-600 dark:text-red-400";
								} else if ("ReimbursedToBuyer" in action) {
									label = "Reimbursed";
									color = "text-orange-600 dark:text-orange-400";
								}

								return (
									<div key={logId.toString()} className="rounded-lg bg-gray-200/80 dark:bg-gray-800/60 p-2.5 space-y-1">
										<div className="flex items-center justify-between">
											<span className={`text-xs font-medium ${color}`}>{label}</span>
											<span className="text-xs text-muted-foreground opacity-70">
												{convertTimestamp(entry.timestamp, 'relative')}
											</span>
										</div>
										{price && (
											<p className="text-sm font-mono">{price}</p>
										)}
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<span>Seller: {shorten(entry.seller.toString(), 4, 4)}</span>
											{entry.buyer.toString() !== entry.seller.toString() && (
												<span>Buyer: {shorten(entry.buyer.toString(), 4, 4)}</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</TabsContent>

				<TabsContent value="share" className="mt-4">
					<div className="space-y-3">
						<p className="text-sm text-muted-foreground mb-3">
							Share this NFT
						</p>
						<div className="space-y-2">
							{/* First row: Twitter and Facebook */}
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									scale="sm"
									onClick={() => handleShare("twitter")}
									className="flex items-center justify-center gap-2 bg-gray-200/80 dark:bg-gray-800/60 border-transparent hover:bg-gray-300/80 dark:hover:bg-gray-700/60"
								>
									<Twitter className="w-4 h-4" />
									Twitter
								</Button>
								<Button
									variant="outline"
									scale="sm"
									onClick={() => handleShare("facebook")}
									className="flex items-center justify-center gap-2 bg-gray-200/80 dark:bg-gray-800/60 border-transparent hover:bg-gray-300/80 dark:hover:bg-gray-700/60"
								>
									<Facebook className="w-4 h-4" />
									Facebook
								</Button>
							</div>
							{/* Second row: Threads and Email */}
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									scale="sm"
									onClick={() => handleShare("threads")}
									className="flex items-center justify-center gap-2 bg-gray-200/80 dark:bg-gray-800/60 border-transparent hover:bg-gray-300/80 dark:hover:bg-gray-700/60"
								>
									<AtSign className="w-4 h-4" />
									Threads
								</Button>
								<Button
									variant="outline"
									scale="sm"
									onClick={() => handleShare("email")}
									className="flex items-center justify-center gap-2 bg-gray-200/80 dark:bg-gray-800/60 border-transparent hover:bg-gray-300/80 dark:hover:bg-gray-700/60"
								>
									<Mail className="w-4 h-4" />
									Email
								</Button>
							</div>
							{/* Third row: Copy Link (full width) */}
							<Button
								variant="outline"
								scale="sm"
								onClick={() => handleShare("copy")}
								className="w-full flex items-center justify-center gap-2 bg-gray-200/80 dark:bg-gray-800/60 border-transparent hover:bg-gray-300/80 dark:hover:bg-gray-700/60"
							>
								<Copy className="w-4 h-4" />
								Copy Link
							</Button>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</>
	);
};

export default ArweaveInfo;
