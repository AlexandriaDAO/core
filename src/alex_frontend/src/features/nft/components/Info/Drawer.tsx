import React from "react";
import { ExternalLink, X, Hash, User, Info as InfoIcon } from "lucide-react";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription } from "@/lib/components/sheet";
import { Badge } from "@/lib/components/badge";
import { Button } from "@/lib/components/button";
import Copy from "@/components/Copy";

import useTransactionMetadata from "../../hooks/useTransactionMetadata";
import { getFileTypeInfo } from "@/features/pinax/constants";
import Metadata from "./Metadata";
import Tags from "./Tags";
import IcpInfo from "./Icp";
import { MinimalToken } from "@/features/alexandrian/types/common";

interface InfoProps {
	id: string;
	owner?: string;
	type?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	token?: MinimalToken;
}

const Info: React.FC<InfoProps> = ({ id, owner, type, open, onOpenChange, token }) => {
	const { metadata, loading: metadataLoading } = useTransactionMetadata(id, open);

	const assetType = type ? getFileTypeInfo(type)?.label : undefined;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="h-[100vh] overflow-auto p-4 flex flex-col gap-4" onOpenAutoFocus={(e) => e.preventDefault()} closeIcon={null}>
				<SheetTitle className="sr-only">Asset Information</SheetTitle>
				<SheetDescription className="sr-only">View detailed information about this asset including transaction ID, owner, metadata, and tags</SheetDescription>
				<SheetHeader className="space-y-0 flex flex-row items-center justify-between">
					<h2 className="text-primary text-lg font-semibold">Asset</h2>

					<div className="flex items-center justify-between gap-2">
						{assetType && <Badge variant="outline">{assetType}</Badge>}
						<Button
							variant="ghost"
							scale="sm"
							onClick={() => onOpenChange(false)}
							className="h-8 w-8 p-0"
						>
							<X className="h-5 w-5" />
							<span className="sr-only">Close</span>
						</Button>
					</div>
				</SheetHeader>

				{/* Asset & Transaction Details */}
				<div className="space-y-3">
					{/* Transaction ID - First */}
					<div className="flex flex-col items-start gap-2">
						<div className="flex justify-start items-center gap-2">
							<div className="p-1 bg-warning/10 rounded-lg">
								<Hash size={18} className="text-warning" />
							</div>
							<span className="text-sm font-medium text-foreground">Transaction ID</span>
						</div>
						<div className="flex w-full items-center gap-2">
							<code className="flex-grow text-xs font-mono bg-background px-2 py-1 rounded border whitespace-nowrap overflow-x-auto scrollbar-none">{id}</code>
							<Copy text={id} size="sm" />
						</div>
					</div>

					{/* Transaction Owner - Second */}
					{metadata?.owner && (
						<div className="flex flex-col items-start gap-2">
							<div className="flex justify-start items-center gap-2">
								<div className="p-1 bg-purple-500/10 rounded-lg">
									<User size={18} className="text-warning" />
								</div>
								<span className="text-sm font-medium text-foreground">Transaction Owner</span>
							</div>
							<div className="flex w-full items-center gap-2">
								<code className="flex-grow text-xs font-mono bg-background px-2 py-1 rounded border whitespace-nowrap overflow-x-auto scrollbar-none">{metadata.owner}</code>
								<Copy text={metadata.owner} size="sm" />
							</div>
						</div>
					)}

					{/* Token Owner - Third */}
					{owner && (
						<div className="flex flex-col items-start gap-2">
							<div className="flex justify-start items-center gap-2">
								<div className="p-1 bg-purple-500/10 rounded-lg">
									<User size={18} className="text-warning" />
								</div>
								<span className="text-sm font-medium text-foreground">Token Owner</span>
							</div>
							<div className="flex w-full items-center gap-2">
								<code className="flex-grow text-xs font-mono bg-background px-2 py-1 rounded border whitespace-nowrap overflow-x-auto scrollbar-none">{owner}</code>
								<Copy text={owner} size="sm" />
							</div>
						</div>
					)}
				</div>

				{/* Metadata Loading */}
				{metadataLoading && (
					<div className="flex-grow flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-muted-foreground"></div>
					</div>
				)}

				<div className="flex-grow overflow-hidden">
					<Tags tags={metadata?.tags} />
				</div>


				<SheetFooter className="mt-2">
					<div className="w-full flex flex-col gap-2">
						{/* ICP Info Section */}
						{token && <IcpInfo token={token} />}

						<Metadata size={metadata?.size} timestamp={metadata?.timestamp} status={metadata?.status} />
						<hr className="border-t px-2 mt-2"/>
						<Button
							variant="outline"
							scale="sm"
							className="w-full flex items-center gap-2"
							onClick={() => window.open(`https://viewblock.io/arweave/tx/${id}`, '_blank')}
						>
							<ExternalLink className="h-4 w-4" />
							View on ViewBlock
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
};

export default Info;