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
} from "lucide-react";
import { Button } from "@/lib/components/button";
import { toast } from "sonner";

interface ArweaveInfoProps {
	// arweave id
	id: string;
}

const ArweaveInfo: React.FC<ArweaveInfoProps> = ({ id }) => {
	const { metadata, loading: metadataLoading } = useTransactionMetadata(id);
	const [activeTab, setActiveTab] = useState("tags");
	
	// Convert Arweave ID to token ID
	const tokenId = arweaveIdToNat(id).toString();
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
				<TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto">
					<TabsTrigger
						value="tags"
						className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-2"
					>
						<Tag className="w-4 h-4 mr-1" />
						Tags
					</TabsTrigger>
					<TabsTrigger
						value="comments"
						className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-2"
					>
						<MessageCircle className="w-4 h-4 mr-1" />
						Comments
					</TabsTrigger>
					<TabsTrigger
						value="share"
						className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-2"
					>
						<Share2 className="w-4 h-4 mr-1" />
						Share
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
									className="flex items-center justify-center gap-2"
								>
									<Twitter className="w-4 h-4" />
									Twitter
								</Button>
								<Button
									variant="outline"
									scale="sm"
									onClick={() => handleShare("facebook")}
									className="flex items-center justify-center gap-2"
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
									className="flex items-center justify-center gap-2"
								>
									<AtSign className="w-4 h-4" />
									Threads
								</Button>
								<Button
									variant="outline"
									scale="sm"
									onClick={() => handleShare("email")}
									className="flex items-center justify-center gap-2"
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
								className="w-full flex items-center justify-center gap-2"
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
