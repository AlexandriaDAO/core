import React, { useState } from "react";
import { Maximize2, X, ExternalLink, Ellipsis, ArrowDown, ArrowUp, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from "@/lib/components/dialog";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/lib/components/card";
import { Badge } from "@/lib/components/badge";
import { Button } from "@/lib/components/button";
import CardSkeleton from "@/layouts/skeletons/emporium/components/CardSkeleton";
import Asset from "./components/Asset";
import Info from "./components/Info";
import Tags from "./components/Tags";
import Metadata from "./components/Metadata";
import Attributes from "./components/Attributes";
import useStatus from "./hooks/useStatus";
import useSize from "./hooks/useSize";
import useTags from "./hooks/useTags";
import useTimestamp from "./hooks/useTimestamp";
import useData from "./hooks/useData";
import { copyToClipboard } from "../upload/utils";

interface NftProps {
	id: string;
	action: React.ReactNode;
	price?: string;
	owner?: string;
	canister?: string
}

const Nft: React.FC<NftProps> = ({ id, action, price, owner, canister }) => {
	const { status, loading: statusLoading, error: statusError } = useStatus(id);
	const { readableSize } = useSize(id, status);
	const { tags, loading: tagsLoading, error: tagsError, contentType, assetType } = useTags(id, status);
	const { readableTimestamp } = useTimestamp(status);

	const {data, loading: dataLoading, error: dataError, progress} = useData(id, status, canister);

	const [info, setInfo] = useState(false);
	const [fullscreen, setFullscreen] = useState(false);

	const [showAttributes, setShowAttributes] = useState(false);

	if (statusLoading) return <CardSkeleton />;

	if (status === null) return null

	if (statusError) {
		return (
			<Card className="overflow-hidden border-destructive/40">
				<div className="h-56 w-full bg-destructive/10 flex items-center justify-center">
					<p className="text-destructive/70">Error loading NFT</p>
				</div>
				<CardContent className="p-4 flex justify-center items-center">
					<p className="text-destructive text-sm">{statusError}</p>
				</CardContent>
			</Card>
		);
	}

	// const floatingIconClasses = "absolute p-1 rounded-full bg-secondary text-gray-700 dark:text-gray-300 opacity-0 scale-0 group-hover:scale-100 group-hover:opacity-100 group-hover:hover:text-black dark:group-hover:hover:text-white border border-ring group-hover:hover:border-black dark:group-hover:hover:border-gray-300 transition-all duration-300 transform cursor-pointer";
	const floatingIconClasses = "p-1 rounded-full bg-secondary text-gray-700 dark:text-gray-300 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-hover:hover:text-black dark:group-hover:hover:text-white border border-ring group-hover:hover:border-black dark:group-hover:hover:border-gray-300 transition-all duration-300 transform cursor-pointer flex-shrink-0";

	return (
		<>
			<Card className="w-full overflow-hidden relative group border border-ring/50 hover:shadow-md hover:border-ring flex flex-col self-start">
				<CardHeader className="relative bg-muted pt-2 px-2 pb-0 space-y-0 flex flex-row justify-center items-center gap-1">
					{/* <Maximize2 strokeWidth={1} onClick={() => setFullscreen(true)} size={24} className={floatingIconClasses + " left-2"}/> */}

					<Maximize2 strokeWidth={1} onClick={() => setFullscreen(true)} size={26} className={floatingIconClasses}/>

					{/* <code className="border border-transparent group-hover:border-ring group-hover:max-w-[83.333333%] text-muted-foreground p-1 rounded text-center font-light text-sm font-roboto-condensed whitespace-nowrap overflow-x-auto scrollbar-none relative group/txid"> */}
					<code className="flex-grow border border-transparent group-hover:border-ring text-muted-foreground p-1 rounded text-center font-light text-sm font-roboto-condensed whitespace-nowrap overflow-x-auto scrollbar-none relative group/txid">
						{id}
						<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/5 opacity-0 group-hover/txid:opacity-100 transition-opacity rounded flex items-center justify-center">
							<Button
								variant="secondary"
								scale="sm"
								onClick={() =>
									copyToClipboard(id)
								}
								className="shadow-sm border border-info text-xs font-normal h-full w-full m-1 p-1"
							>
								<Copy className="h-4 w-4" />
								Copy ID
							</Button>
						</div>
					</code>
					{/* <Ellipsis strokeWidth={1} onClick={() => setInfo(!info)} size={24} className={floatingIconClasses + " right-2"}/> */}
					<Ellipsis strokeWidth={1} onClick={() => setInfo(!info)} size={26} className={floatingIconClasses}/>
				</CardHeader>

				{/* <div className="relative group/txid">
					<code className="block w-full border bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm font-mono break-all">
						{id}
					</code>
					<div className="absolute inset-0 bg-gray-900/5 opacity-0 group-hover/txid:opacity-100 transition-opacity rounded flex items-center justify-center">
						<Button
							variant="secondary"
							scale="sm"
							onClick={() =>
								copyToClipboard(id)
							}
							className="shadow-sm"
						>
							<Copy className="h-4 w-4 mr-2" />
							Copy ID
						</Button>
					</div>
				</div> */}

				<Asset data={data} dataLoading={dataLoading} tagsLoading={tagsLoading} progress={progress} contentType={contentType} />
				{/* <div className="relative">
					<div className="absolute bottom-2 left-2 w-full h-full flex gap-1 justify-start items-center">
						<Badge variant="outline">AR</Badge>
						<Badge variant="outline">ICP</Badge>
					</div>
				</div> */}

				{/* Info overlay */}
				{info && <Info tags={tags} loading={tagsLoading} error={tagsError} onClose={() => setInfo(false)}/>}

				<CardContent className="p-3 space-y-4">
					<div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
						{price && <div className="flex items-center gap-1 flex-grow">
							<Badge variant="outline" className="flex items-center gap-1 flex-nowrap">
								<span>Price:</span>
								<span>{price}</span>
								<span>ICP</span>
							</Badge>
						</div>}
						<div className={`flex-grow flex ${price ? 'justify-end':'justify-between'} items-center gap-1`}>
							<div className="flex gap-1 justify-between items-center">
								<Badge variant="outline">AR</Badge>
								<Badge variant="outline">ICP</Badge>
							</div>
							<div className="flex gap-1 justify-between items-center">
								{assetType && <Badge variant="outline">{assetType}</Badge>}

								{typeof status === 'string' && <Badge variant="outline" className="bg-info text-info-foreground">{status}</Badge>}

								{owner && (
									<Badge variant="outline" onClick={() => setShowAttributes(!showAttributes)} className="cursor-pointer px-1">
										{showAttributes ? <ArrowUp size={16} />:<ArrowDown size={16} />}
									</Badge>
								)}
							</div>
						</div>
					</div>

					<div className="relative">
						{showAttributes && owner && <Attributes owner={owner} />}

						<Metadata
							readableTimestamp={readableTimestamp}
							readableSize={readableSize}
							status={status}
						/>
					</div>

				</CardContent>

				<CardFooter className="p-2 pt-0">
					{action}
				</CardFooter>
			</Card>

			{/* Fullscreen modal */}
			<Dialog open={fullscreen} onOpenChange={setFullscreen}>
				<DialogContent className="max-w-4xl w-full p-4" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
					<DialogHeader className="flex flex-col space-y-0">
						<DialogTitle className="flex items-center justify-between gap-2">
							<span>{id}</span>
							<div className="flex items-center justify-between gap-3">
								<ExternalLink xlinkTitle="View on ViewBlock" strokeWidth={1} onClick={()=>window.open(`https://viewblock.io/arweave/tx/${id}`, "_blank")} size={22} className="text-gray-700 hover:text-black transition-all cursor-pointer" />
								<X xlinkTitle="Close fullscreen view" strokeWidth={1} onClick={()=>setFullscreen(false)} size={26} className="text-gray-700 hover:text-black transition-all cursor-pointer"/>
							</div>
						</DialogTitle>
						<DialogDescription>
							Here you can view the general Information about your NFT.
						</DialogDescription>
					</DialogHeader>

					<Asset data={data} contentType={contentType} dataLoading={dataLoading} tagsLoading={tagsLoading} progress={progress} fullscreen />
					<Tags tags={tags} loading={tagsLoading} error={tagsError} />
				</DialogContent>
			</Dialog>
		</>
	);
};

export default Nft;
