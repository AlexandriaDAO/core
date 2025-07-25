import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/lib/components/card";
import { Badge } from "@/lib/components/badge";
import Asset from "./components/Asset";
import Copy from "@/components/Copy";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";
import Info from "./components/Info/index";
import Preview from "./components/Asset/Preview";
import useInit from "./hooks/useInit";
import { MinimalToken } from "@/features/alexandrian/types/common";

interface NftProps {
	id: string;
	action?: React.ReactNode;
	price?: string;
	owner?: string;
	canister?: string;
	checkNsfw?: boolean;
	token?: MinimalToken;
}

const Nft: React.FC<NftProps> = ({ id, action, price, owner, canister, checkNsfw = false, token }) => {
	const {initializing, initError, inCanister, type, assetUrl} = useInit(id, canister);
	const [isNsfw, setIsNsfw] = useState(false);

	if(initError) return <></>;

	return (
		<Card className="w-full overflow-hidden relative group border border-ring/50 hover:shadow-md hover:border-ring flex flex-col self-start">
			{/* NSFW Frosted Glass Overlay */}
			{checkNsfw && isNsfw && (
				<div className="absolute inset-0 z-10 backdrop-blur-lg bg-white/30 dark:bg-black/30 shadow-inner border border-white/40 dark:border-gray-600/40 rounded-md flex items-center justify-center">
					<div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/60 dark:border-gray-500/60">
						<div className="text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-2">
							<div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
							Content Filtered
						</div>
					</div>
				</div>
			)}

			<CardHeader className="bg-muted pt-2 px-2 pb-0 space-y-0 grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center justify-center gap-1.5">
				<div className="relative">
					<code className="block w-full border-b border-b-transparent group-hover:border-b-ring text-muted-foreground p-0.5 text-left font-light text-sm font-roboto-condensed whitespace-nowrap overflow-x-auto scrollbar-none">{id}</code>
					<div className="hidden group-hover:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted to-transparent pointer-events-none"></div>
				</div>
				<Copy text={id} size="sm"/>
				<Info id={id} owner={owner} type={type} token={token ? {...token, synced: inCanister} : undefined}/>
			</CardHeader>

			{ initializing ? <AssetSkeleton /> : assetUrl ? <Asset id={id} url={assetUrl} type={type} checkNsfw={checkNsfw} setIsNsfw={setIsNsfw} /> : <Preview message="Preview not available" />}

			{(inCanister || price) && (
				<CardContent className="p-2 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none border-b border-b-muted-foreground/20">
					{price && <div className="flex items-center gap-1 flex-grow">
						<Badge variant="outline" className="flex items-center gap-1 flex-nowrap">
							<span>Price:</span>
							<span>{price}</span>
							<span>ICP</span>
						</Badge>
					</div>}
					<div className={`flex-grow flex ${price ? 'justify-end':'justify-between'} items-center gap-1`}>
						<div className="flex gap-1 justify-between items-center">
							{inCanister && <Badge variant="outline">ICP</Badge>}
							<Badge variant="outline">AR</Badge>
						</div>
					</div>
				</CardContent>
			)}

			{action &&
				<CardFooter className="p-2 flex flex-wrap items-center justify-start gap-2">
					{action}
				</CardFooter>
			}
		</Card>
	);
};

export default Nft;
