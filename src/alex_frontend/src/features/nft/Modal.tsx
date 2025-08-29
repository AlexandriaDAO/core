import React, { useState } from "react";
import Preview from "./components/Asset/Preview";
import { ErrorBoundary } from "react-error-boundary";
import AssetModal from "./components/Asset/Modal";
import { useNftContext } from "@/components/NftProvider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/lib/components/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/card";
import { Button } from "@/lib/components/button";
import { ChevronLeft, ChevronRight, CircleEllipsis, X, XCircle } from "lucide-react";
import ArweaveInfo from "@/features/nft/components/Info/Arweave";
import IcpInfo from "@/features/nft/components/Info/Icp";
import { copyToClipboard, shorten } from "@/utils/general";

interface NFTModalProps {
	goToPrevious?: () => void;
	goToNext?: () => void;
	canGoPrevious?: boolean;
	canGoNext?: boolean;
}

const NFTModal: React.FC<NFTModalProps> = ({ goToPrevious, goToNext, canGoPrevious, canGoNext }) => {
	const { safe, modal, setModal} = useNftContext();
	const [ nsfw, setNsfw] = useState<boolean>(false);
	const [sidebar, setSidebar] = useState<boolean>(false);

	if(!modal) return;

	return (
		<Dialog open={true} onOpenChange={() => setModal(null)}>
			<DialogContent
				className="p-0 border-none bg-transparent flex flex-col md:flex-row gap-2 justify-between items-stretch focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-within:outline-none focus-within:ring-0 active:outline-none active:ring-0 hover:outline-none hover:ring-0 max-w-7xl w-full h-[70vh]"
				closeIcon={null}
			>
				<DialogHeader className="absolute z-[1] top-4 right-4 flex flex-col space-y-0">
					<DialogTitle className="w-full">
						<Button
							variant="muted"
							scale="icon"
							rounded="full"
							onClick={() => setModal(null)}
							className="border-none p-0"
						>
							<X xlinkTitle="Close modal view" strokeWidth={2} className="p-0" />
						</Button>
					</DialogTitle>
					<DialogDescription className="sr-only">Asset Preview</DialogDescription>
				</DialogHeader>

				<div className="py-6 relative flex items-center w-full h-full bg-background rounded-lg border border-border/30 overflow-hidden">
					<div className="basis-14 flex-shrink-0 flex-grow-0 flex justify-center">
						<Button
							variant="muted"
							scale="icon"
							rounded="full"
							onClick={goToPrevious}
							className="border-none p-0"
							disabled={!canGoPrevious}
						>
							<ChevronLeft
								xlinkTitle="Go to Previous"
								strokeWidth={2}
							/>
						</Button>
					</div>

					<ErrorBoundary fallback={<Preview title="Asset failed to load" />}>
						<AssetModal id={modal.id} />
					</ErrorBoundary>

					<div className="basis-14 flex-shrink-0 flex-grow-0 flex justify-center">
						<Button
							variant="muted"
							scale="icon"
							rounded="full"
							onClick={goToNext}
							className="border-none p-0"
							disabled={!canGoNext}
						>
							<ChevronRight
								xlinkTitle="Go to Next"
								strokeWidth={2}
							/>
						</Button>
					</div>
				</div>


				{sidebar && (
					<>
						<div className="border-l-2 my-4"/>
						<Card className="border-border/30 basis-1/4 p-2 flex-grow-0 flex-shrink-0 font-roboto-condensed flex gap-4 flex-col justify-between">
							<CardHeader className="p-2 flex flex-col items-stretch justify-between">
								<CardTitle className="break-all text-md cursor-copy font-mono" onClick={() => copyToClipboard(modal.id)}>{shorten(modal.id, 6, 6)}</CardTitle>
								<CardDescription className="sr-only">Detailed information about this asset including transaction ID, owner, metadata, and tags</CardDescription>
							</CardHeader>
							<CardContent className="p-2 overflow-auto flex-grow flex flex-col gap-4">
								<ErrorBoundary fallback={<Preview title="Loading Error" description="Arweave Info failed to load" />}>
									<ArweaveInfo key={modal.id} id={modal.id} />
								</ErrorBoundary>
							</CardContent>
							{modal.token && (
								<ErrorBoundary fallback={<Preview title="Loading Error" description="ICP Info failed to load" />}>
									<IcpInfo token={modal.token} />
								</ErrorBoundary>
							)}
						</Card>
					</>
				)}

				<DialogFooter className="absolute z-[1] bottom-4 right-4">
					<Button
						variant="muted"
						scale="icon"
						rounded="full"
						onClick={() => setSidebar(!sidebar)}
						className="border-none p-0"
					>
						{sidebar ? <XCircle xlinkTitle="Close Sidebar" strokeWidth={2}/> : <CircleEllipsis xlinkTitle="Open Sidebar" strokeWidth={2}/>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>

	);
};

export default NFTModal;
