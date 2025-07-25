import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from "@/lib/components/dialog";
import AssetCard from "./Card";
import AssetModal from "./Modal";
import { getFileTypeInfo } from "@/features/pinax/constants";
import { X, ExternalLink, Maximize, Minimize } from "lucide-react";
import { Badge } from "@/lib/components/badge";
import Download from "@/components/Download";
import { ErrorBoundary } from "react-error-boundary";
import Preview from "./Preview";

interface AssetProps {
	id: string;
	url: string;
	type?: string;
	checkNsfw: boolean;
	setIsNsfw: (isNsfw: boolean) => void;
}

const Asset: React.FC<AssetProps> = ({ id, url, type, checkNsfw, setIsNsfw }) => {
	const [modal, setModal] = useState<boolean>(false);
	const [fullscreen, setFullscreen] = useState<boolean>(false);

	// Use the type from useInit (already has correct content-type from asset fetch)
	const assetType = type ? getFileTypeInfo(type)?.label : undefined;

	const scrollClasses = "overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400";

	return (
		<>
			<div
				className={`cursor-pointer w-full max-h-80 bg-muted p-2 flex-grow flex flex-col items-center justify-center ${scrollClasses}`}
				onClick={() => setModal(true)}
			>
				<ErrorBoundary fallback={<Preview message="Asset preview failed to load" />}>
					<AssetCard type={type} url={url} checkNsfw={checkNsfw} setIsNsfw={setIsNsfw} />
				</ErrorBoundary>
			</div>

			{modal && (
				<Dialog open={modal} onOpenChange={setModal}>
					<DialogContent className={fullscreen ? "max-w-none w-screen h-screen m-0 p-4" : "max-w-4xl w-full p-4"} closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
						<DialogHeader className="flex flex-col space-y-0">
							<DialogTitle className="flex items-center justify-between gap-2">
								<span>Asset Preview</span>
								<div className="flex items-center justify-between gap-3">
									{assetType && <Badge variant="outline">{assetType}</Badge>}
									<Download url={url} name={`asset-${id}`} size="base" />
									{fullscreen ? (
										<Minimize xlinkTitle="Exit fullscreen" strokeWidth={1} onClick={() => setFullscreen(false)} size={20} className="text-muted-foreground hover:text-black dark:hover:text-white transition-all cursor-pointer" />
									) : (
										<Maximize xlinkTitle="Enter fullscreen" strokeWidth={1} onClick={() => setFullscreen(true)} size={20} className="text-muted-foreground hover:text-black dark:hover:text-white transition-all cursor-pointer" />
									)}
									<ExternalLink xlinkTitle="View on ViewBlock" strokeWidth={1} onClick={()=>window.open(`https://viewblock.io/arweave/tx/${id}`, "_blank")} size={22} className="text-muted-foreground hover:text-black dark:hover:text-white transition-all cursor-pointer" />
									<X xlinkTitle="Close fullscreen view" strokeWidth={1} onClick={()=>setModal(false)} size={26} className="text-muted-foreground hover:text-black dark:hover:text-white transition-all cursor-pointer"/>
								</div>
							</DialogTitle>
							<DialogDescription>{id}</DialogDescription>
						</DialogHeader>

						<div className={`w-full ${fullscreen ? 'h-[calc(100vh-8rem)]' : 'max-h-[60vh]'} ${scrollClasses}`}>
							<ErrorBoundary fallback={<Preview message="Asset modal failed to load" />}>
								<AssetModal type={type} url={url} />
							</ErrorBoundary>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};

export default Asset;
