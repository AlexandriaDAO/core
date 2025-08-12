import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import { Badge } from "@/lib/components/badge";
import Preview from "./components/Asset/Preview";
import useInit from "./hooks/useInit";
import { ErrorBoundary } from "react-error-boundary";
import AssetCard from "./components/Asset/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/lib/components/dialog";
import { PanelRight, X, CloudCheck } from "lucide-react";
import AssetModal from "./components/Asset/Modal";
import { AlexandrianToken } from "../alexandrian/types";
import { copyToClipboard, shorten } from "@/utils/general";
import ArweaveInfo from "./components/Info/Arweave";
import IcpInfo from "./components/Info/Icp";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

interface NftProps {
	id: string;
	action?: React.ReactNode;
	price?: string;
	checkNsfw?: boolean;
	// canister comes from emporium marketplace
	canister?: string;
	// token comes from alexandrian page
	token?: AlexandrianToken
}

const Nft: React.FC<NftProps> = ({ id, action, price, canister, checkNsfw = false, token }) => {
	const {initializing, initError, inCanister, type, assetUrl} = useInit(id, canister);
	const [isNsfw, setIsNsfw] = useState(false);

	const [modal, setModal] = useState<boolean>(false);
	const [sidebar, setSidebar] = useState<boolean>(false);

	if(initializing) return <AssetSkeleton />;
	if(initError) return null;

	return (
		<>
			<ErrorBoundary fallback={<Preview message="Asset preview failed to load" />}>
				<div onClick={() => setModal(true)} className="min-h-28 min-w-36 max-w-full place-content-center place-items-center relative inline-block border-2 border-transparent hover:border-info rounded-lg overflow-hidden cursor-pointer group/nft transition-all">
					{/* NSFW Frosted Glass Overlay */}
					{checkNsfw && isNsfw && (
						<div className="absolute inset-0 z-20 backdrop-blur-lg bg-white/30 dark:bg-black/30 shadow-inner border border-white/40 dark:border-gray-600/40 rounded-md flex items-center justify-center">
							<div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/60 dark:border-gray-500/60">
								<div className="text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-2">
									<div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
									Content Filtered
								</div>
							</div>
						</div>
					)}

					{action && (
						<div className="absolute top-0 right-2 z-10 flex gap-1 flex-col items-center justify-center transform -translate-y-full group-hover/nft:translate-y-0 transition-transform duration-400 ease-in-out" onClick={event=>event.stopPropagation()}>
							{action}
						</div>
					)}

					<div className="absolute top-0 pt-1 left-1 z-10 flex gap-0.5 flex-row items-stretch transform -translate-y-full group-hover/nft:translate-y-0 transition-transform duration-400 ease-in-out" onClick={event=>event.stopPropagation()}>
						{inCanister && (
							<Tooltip delayDuration={0}>
								<TooltipTrigger>
									<Badge variant="outline" className="h-full w-7 p-1 place-items-center place-content-center rounded-full bg-background text-foreground transition-colors">
										<CloudCheck size={16} className=""/>
									</Badge>
								</TooltipTrigger>
								<TooltipContent side="left" sideOffset={7} portal>Synced</TooltipContent>
							</Tooltip>
						)}
						{price && (
							<Badge variant="outline" className="px-2 text-sm bg-background text-foreground transition-colors">
								{price} ICP
							</Badge>
						)}
					</div>

					{assetUrl && <AssetCard type={type} url={assetUrl} checkNsfw={checkNsfw} setIsNsfw={setIsNsfw} />}
				</div>
			</ErrorBoundary>

			{modal && assetUrl && (
				<Dialog open={modal} onOpenChange={setModal}>
					<DialogContent
						className="p-0 border-none bg-transparent flex flex-col md:flex-row gap-2 justify-between items-stretch focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-within:outline-none focus-within:ring-0 active:outline-none active:ring-0 hover:outline-none hover:ring-0 max-w-7xl w-full h-[70vh]"
						closeIcon={null}
					>
						<DialogHeader className="p-4 absolute z-[1] top-0 right-0 flex flex-col space-y-0">
							<DialogTitle className="w-full flex items-center justify-between gap-2">
								<X xlinkTitle="Close fullscreen view" strokeWidth={1} onClick={()=>setModal(false)} className="text-muted-foreground hover:text-black dark:hover:text-white transition-all cursor-pointer"/>
								<PanelRight xlinkTitle="Open Sidebar" strokeWidth={1} onClick={()=>setSidebar(sidebar=>!sidebar)} className="text-muted-foreground hover:text-black dark:hover:text-white transition-all cursor-pointer"/>
								{/* <Info id={id} owner={owner} type={type} token={token ? {...token, synced: inCanister} : undefined}/> */}
							</DialogTitle>
							<DialogDescription className="sr-only">Asset Preview</DialogDescription>
						</DialogHeader>
						<ErrorBoundary fallback={<Preview message="Asset Preview failed to load" />}>
							<AssetModal type={type} url={assetUrl} />
						</ErrorBoundary>

						{ sidebar && <>
							<div className="border-l-2 my-4"/>

							<Card className="border-border/30 basis-1/4 p-4 flex-grow-0 flex-shrink-0 font-roboto-condensed flex gap-4 flex-col justify-between">
								<CardHeader className="p-0 flex flex-col items-stretch justify-between">
									<CardTitle className="break-all text-md cursor-copy font-mono" onClick={()=>copyToClipboard(id)}>{shorten(id, 6, 6)}</CardTitle>
									<CardDescription className="sr-only">Detailed information about this asset including transaction ID, owner, metadata, and tags</CardDescription>
								</CardHeader>
								<CardContent className="p-0 overflow-auto flex-grow flex flex-col gap-4">
									<ErrorBoundary fallback={<Preview message="Arweave Info failed to load" />}>
										<ArweaveInfo id={id} />
									</ErrorBoundary>
								</CardContent>
								{token && <ErrorBoundary fallback={<Preview message="ICP Info failed to load" />}>
									<IcpInfo token={token} />
								</ErrorBoundary>}
							</Card>
						</>}
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};

export default Nft;
