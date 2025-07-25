import React, { useState } from "react";
import { ExternalLink, Flag, Check, Hash, Cloud, CloudOff } from "lucide-react";
import { Badge } from "@/lib/components/badge";
import { useQuery } from "@tanstack/react-query";
import { wait } from "@/utils/lazyLoad";
import { Link } from "@tanstack/react-router";
import { fetchIcpInfo } from "@/features/alexandrian/api/fetchIcpInfo";
import { MinimalToken } from "@/features/alexandrian/types/common";

interface IcpInfoProps {
	token: MinimalToken;
}

const IcpInfo: React.FC<IcpInfoProps> = ({ token }) => {
	const [copied, setCopied] = useState(false);

	const { data, isLoading, error } = useQuery({
		queryKey: ['icpInfo', token.id, token.collection],
		queryFn: () => fetchIcpInfo(token.id, token.collection),
		enabled: !!token.id && !!token.collection,
	});

	const handleCopyTokenId = async () => {
		navigator.clipboard.writeText(token.id);
		setCopied(true);
		await wait(2000);
		setCopied(false);
	};

	const getTruncatedTokenId = (tokenId: string) => {
		if (tokenId.length <= 6) return tokenId;
		return `${tokenId.slice(0, 3)}...${tokenId.slice(-3)}`;
	};

	if (isLoading) {
		return (
			<div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-lg p-4 shadow-sm">
				<div className="flex flex-wrap gap-2 font-roboto-condensed">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground"></div>
					<span className="text-sm text-muted-foreground">Loading ICP info...</span>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-lg p-4 shadow-sm">
				<div className="flex flex-wrap gap-2 font-roboto-condensed">
					<span className="text-sm text-red-500">Failed to load ICP info</span>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-lg p-4 shadow-sm">
			<div className="flex flex-wrap gap-2 font-roboto-condensed">
			<Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/30 hover:bg-orange-500/20 hover:text-orange-800 transition-colors cursor-default">
				{data.alex.toFixed(2)} ALEX
			</Badge>
			<Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20 hover:text-green-800 transition-colors cursor-default">
				{data.lbry.toFixed(2)} LBRY
			</Badge>
			{data.rank && (
				<Badge variant="default" className="flex items-center gap-1 bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30 hover:text-yellow-800 transition-colors cursor-default">
					<Flag size={12} className="text-yellow-600" />
					{`${(data.rank / 100).toFixed(2)}% Rarity`}
				</Badge>
			)}
			<Badge variant="outline" className={`flex items-center gap-1 ${token.synced ? 'bg-green-500/10 text-green-700 border-green-500/30' : 'bg-red-500/10 text-red-700 border-red-500/30'} hover:bg-opacity-20 transition-colors cursor-default`}>
				{token.synced ? <Cloud size={12} /> : <CloudOff size={12} />}
				{token.synced ? 'Synced' : 'Not Synced'}
			</Badge>
			<Badge
				variant="outline"
				className="flex items-center gap-1 bg-gray-500/10 text-gray-700 border-gray-500/30 hover:bg-gray-500/20 hover:text-gray-800 transition-colors cursor-pointer"
				onClick={handleCopyTokenId}
			>
				{copied ? <Check size={12} /> : <Hash size={12} />}
				{copied ? 'Copied!' : getTruncatedTokenId(token.id)}
			</Badge>
			<Link to="/nft/$tokenId" params={{ tokenId: token.id }}>
				<Badge
					variant="outline"
					className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
				>
					<ExternalLink size={12} className="mr-1" />
					View Token
				</Badge>
			</Link>
			</div>
		</div>
	);
};

export default IcpInfo;