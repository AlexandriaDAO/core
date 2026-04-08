import React from "react";
import { Card } from "@/lib/components/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { useNftArweaveId } from "../hooks/useNftArweaveId";
import { useNftContext } from "@/components/NftProvider";
import AssetCard from "@/features/nft/components/Asset/Card";

interface NftItemCardProps {
	tokenId: string;
	listView?: boolean;
}

export default function NftItemCard({ tokenId, listView }: NftItemCardProps) {
	const { data: arweaveId, isLoading, error } = useNftArweaveId(tokenId);
	const { setModal } = useNftContext();

	if (isLoading) {
		return (
			<Card className={`flex items-center justify-center bg-muted/30 dark:bg-gray-800/50 ${listView ? "h-16" : "min-h-40"}`}>
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground dark:text-gray-400" />
			</Card>
		);
	}

	if (error || !arweaveId) {
		return (
			<Card className={`flex items-center gap-3 bg-muted/30 dark:bg-gray-800/50 text-muted-foreground dark:text-gray-400 ${listView ? "h-16 px-4" : "min-h-40 flex-col justify-center"}`}>
				<div className="h-8 w-8 rounded-full bg-muted dark:bg-gray-700 flex items-center justify-center shrink-0">
					<AlertTriangle className="h-4 w-4" />
				</div>
				<span className="text-sm">Failed to load NFT</span>
			</Card>
		);
	}

	if (listView) {
		return (
			<Card
				className="overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 px-3 py-2"
				onClick={() => setModal({ id: arweaveId })}
			>
				<div className="h-12 w-12 rounded-md overflow-hidden shrink-0 self-center">
					<AssetCard id={arweaveId} />
				</div>
				<div className="flex flex-col justify-center min-w-0">
					<span className="text-sm font-roboto-condensed font-medium">Token ID: {tokenId}</span>
					<span className="text-xs font-mono text-muted-foreground dark:text-gray-400 truncate">Arweave ID: {arweaveId}</span>
				</div>
			</Card>
		);
	}

	return (
		<Card
			className="overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
			onClick={() => setModal({ id: arweaveId })}
		>
			<AssetCard id={arweaveId} />
		</Card>
	);
}
