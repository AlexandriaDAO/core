import React, { useEffect } from "react";
import { ArweaveAssetItem } from "../types";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import { Button } from "@/lib/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/lib/components/dialog";
import { Clock, Download, ExternalLink, FileType, Trash2, X } from "lucide-react";
import { getFileTypeInfo, getFileTypeName } from "@/features/upload/constants";
import Copy from "@/components/Copy";
import { selectAsset } from "../arweaveAssetsSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { checkAssetAvailability } from "../thunks/checkAssetAvailability";
import { pullAssetToCanister } from "../thunks/pullAssetToCanister";
import { deleteAssetFromCanister } from "../thunks/deleteAssetFromCanister";
import { AssetManager } from "@dfinity/assets";

const isLocal = process.env.DFX_NETWORK == "local";

interface AssetDetailProps {
	asset: ArweaveAssetItem;
	assetManager: AssetManager | null;
}

const AssetDetail: React.FC<AssetDetailProps> = ({ asset, assetManager }) => {
	const dispatch = useAppDispatch();
	const { canister } = useAppSelector(state => state.auth);
	const {pulling, pullError, deleting, deleteError} = useAppSelector((state) => state.arweaveAssets);
	const { assets: icpAssets } = useAppSelector((state) => state.icpAssets);

	// Check if asset is in canister
	useEffect(() => {
		if(assetManager){
			dispatch(checkAssetAvailability({ asset, assetManager }));
		}

	}, [assetManager, asset]);

	// Function to pull asset to user's canister
	const handlePullAsset = async () => {
		if (!assetManager) {
			toast.error("No asset canister available. Please create one first.");
			return;
		}

		dispatch(pullAssetToCanister({ asset, assetManager }));
	};

	// Function to delete asset from user's canister
	const handleDeleteAsset = async () => {
		if (!assetManager) {
			toast.error("No asset canister available.");
			return;
		}

		// Confirm deletion
		if (!window.confirm(
			`Are you sure you want to delete this asset from your canister?\nThis won't delete it from Arweave.`
		)) {
			return;
		}

		dispatch(deleteAssetFromCanister({ asset, assetManager }));
	};

	// Helper function to format timestamp
	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "Unknown";
		return new Date(timestamp * 1000).toLocaleString();
	};

	// Get file type info using the constants
	const fileTypeInfo = asset.contentType ? getFileTypeInfo(asset.contentType) : null;
	const isImage = asset.contentType?.includes("image");
	const isVideo = asset.contentType?.includes("video");
	const isAudio = asset.contentType?.includes("audio");
	const isPdf = asset.contentType?.includes("pdf");
	const fileTypeName = asset.contentType ? getFileTypeName(asset.contentType) : "Unknown";

	// Get category label based on content type
	const getCategoryLabel = () => {
		if (isImage) return "Image";
		if (isVideo) return "Video";
		if (isAudio) return "Audio";
		if (isPdf) return "Document";
		return fileTypeInfo?.label || "File";
	};

	// Get color scheme based on file type
	const getColorScheme = () => {
		if (isImage) return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800";
		if (isVideo) return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
		if (isAudio) return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
		if (isPdf) return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
		return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-800";
	};

	// Generate canister asset URL
	const getCanisterAssetUrl = () => {
		if (!canister) return "";
		const baseUrl = isLocal
			? `http://${canister}.localhost:4943`
			// : `https://${canister}.ic0.app`;
			: `https://${canister}.raw.icp0.io`;
		return `${baseUrl}/arweave/${asset.id}`;
	};

	const canisterAssetUrl = getCanisterAssetUrl();

	const handleClose = () => {
		dispatch(selectAsset(null));
	};

	const isAvailableInCanister = (asset: ArweaveAssetItem) => {
		return icpAssets.find((icpAsset) => icpAsset.key === `/arweave/${asset.id}`) ? true : false;
	}

	return (
		<Dialog open onOpenChange={() => handleClose()}>
			<DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl max-h-[90vh] flex flex-col">
				<DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 bg-gray-50 dark:bg-gray-900">
					<div className="flex items-center justify-between">
						<DialogTitle>
							<div className="flex items-center gap-2">
								<div className={`p-2 rounded-lg ${getColorScheme()}`}>
									{fileTypeInfo?.icon || <FileType className="h-5 w-5" />}
								</div>
								<span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getColorScheme()}`}>
									{getCategoryLabel()}
								</span>
								<span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
									{fileTypeName}
								</span>
							</div>
						</DialogTitle>

						<DialogDescription className="hidden">Asset: {asset.id}</DialogDescription>

						<button
							onClick={() => handleClose()}
							className="rounded-full p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
							aria-label="Close"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				</DialogHeader>

				<div className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
					<div className="mb-4 bg-white dark:bg-gray-850 rounded-xl p-0 shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
						{isImage && (
							<div className="relative group">
								<img
									src={isAvailableInCanister(asset) && canisterAssetUrl ? canisterAssetUrl : asset.url}
									alt="Asset preview"
									className="max-h-[300px] w-full mx-auto object-contain bg-[repeating-conic-gradient(#f5f5f5_0deg,#f5f5f5_8deg,#ffffff_8deg,#ffffff_15deg)] dark:bg-[repeating-conic-gradient(#1f1f1f_0deg,#1f1f1f_8deg,#171717_8deg,#171717_15deg)] p-4"
								/>
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
									<a 
										href={isAvailableInCanister(asset) && canisterAssetUrl ? canisterAssetUrl : asset.url} 
										target="_blank" 
										rel="noopener noreferrer"
										className="bg-black/70 text-white hover:bg-black/90 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
									>
										<ExternalLink className="h-4 w-4" />
										View Full Size
									</a>
								</div>
							</div>
						)}
						{isVideo && (
							<div className="relative bg-black">
								<video
									src={isAvailableInCanister(asset) && canisterAssetUrl ? canisterAssetUrl : asset.url}
									controls
									className="max-h-[300px] w-full mx-auto"
								>
									Your browser does not support the video tag.
								</video>
							</div>
						)}
						{isAudio && (
							<div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-850 p-6">
								<div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white">
									{fileTypeInfo?.icon || <FileType className="h-6 w-6" />}
								</div>
								<audio
									src={isAvailableInCanister(asset) && canisterAssetUrl ? canisterAssetUrl : asset.url}
									controls
									className="w-full mx-auto"
								>
									Your browser does not support the audio tag.
								</audio>
							</div>
						)}
						{isPdf && (
							<div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10">
								<div className="text-5xl text-red-400 dark:text-red-500 mb-2 transform hover:scale-105 transition-transform duration-200">
									{fileTypeInfo?.icon || <FileType className="h-12 w-12" />}
								</div>
								<p className="text-gray-700 dark:text-gray-300 mb-3">PDF Document</p>
								<a 
									href={isAvailableInCanister(asset) && canisterAssetUrl ? canisterAssetUrl : asset.url} 
									target="_blank" 
									rel="noopener noreferrer" 
									className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors duration-200 text-sm"
								>
									<ExternalLink className="h-4 w-4" />
									Open PDF
								</a>
							</div>
						)}
						{!isImage && !isVideo && !isAudio && !isPdf && (
							<div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
								<div className="text-5xl text-gray-400 dark:text-gray-500 mb-2 transform hover:scale-105 transition-transform duration-200">
									{fileTypeInfo?.icon || <FileType className="h-12 w-12" />}
								</div>
								<p className="text-gray-700 dark:text-gray-300 mb-3">{fileTypeName} File</p>
								<a 
									href={isAvailableInCanister(asset) && canisterAssetUrl ? canisterAssetUrl : asset.url} 
									target="_blank" 
									rel="noopener noreferrer" 
									className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors duration-200 text-sm"
								>
									<Download className="h-4 w-4" />
									Download File
								</a>
							</div>
						)}
					</div>

					{/* Divider before Canister URL section */}
					<hr className="my-6 border-gray-200 dark:border-gray-800" />

					{/* Canister URL section */}
					{isAvailableInCanister(asset) && canisterAssetUrl && (
						<div className="mb-4">
							<h3 className="font-medium text-gray-900 dark:text-gray-50 mb-2 flex items-center gap-2 text-sm">
								<span className="w-1 h-4 bg-purple-500 rounded-full"></span>
								Canister URL
							</h3>
							<div className="flex items-start justify-between gap-2 bg-white dark:bg-gray-850 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
								<div className="self-center font-mono text-xs break-all text-gray-700 dark:text-gray-300 overflow-x-auto">
									{canisterAssetUrl}
								</div>
								<Copy text={canisterAssetUrl} />
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h3 className="font-medium text-gray-900 dark:text-gray-50 mb-2 flex items-center gap-2 text-sm">
								<span className="w-1 h-4 bg-amber-500 rounded-full"></span>
								Asset Details
							</h3>
							<div className="bg-white dark:bg-gray-850 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
								<ul className="space-y-3 text-sm">
									<li className="flex items-start gap-2">
										<div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-md text-indigo-600 dark:text-indigo-400">
											<FileType className="h-4 w-4" />
										</div>
										<div>
											<span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
												Type
											</span>
											<span className="text-gray-900 dark:text-gray-50 font-medium">
												{fileTypeName}
											</span>
											<span className="text-xs text-gray-500 dark:text-gray-400 block">
												{asset.contentType || "Unknown"}
											</span>
										</div>
									</li>

									<li className="flex items-start gap-2">
										<div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-md text-amber-600 dark:text-amber-400">
											<Clock className="h-4 w-4" />
										</div>
										<div>
											<span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
												Created
											</span>
											<span className="text-gray-900 dark:text-gray-50 font-medium">
												{formatDate(asset.timestamp)}
											</span>
										</div>
									</li>

									<li className="flex items-start gap-2">
										<div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
											{pulling === asset.id ? (
												<div className="h-4 w-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
											) : (
												<div className="h-4 w-4 flex items-center justify-center">
													{isAvailableInCanister(asset) ? (
														<div className="h-2.5 w-2.5 bg-green-500 rounded-full" />
													) : (
														<div className="h-2.5 w-2.5 bg-yellow-500 rounded-full" />
													)}
												</div>
											)}
										</div>
										<div>
											<span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
												Storage
											</span>
											{pulling === asset.id ? (
												<span className="text-gray-400">
													Checking...
												</span>
											) : isAvailableInCanister(asset) ? (
												<span className="text-green-600 dark:text-green-500 font-medium">
													Available in your canister
												</span>
											) : (
												<span className="text-yellow-600 dark:text-yellow-500 font-medium">
													Arweave only
												</span>
											)}
										</div>
									</li>
								</ul>

								<div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
									<Button
										variant="outline"
										scale="sm"
										className="justify-start hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-xs"
										asChild
									>
										<a
											href={asset.url}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="h-3 w-3 mr-1" />
											Arweave
										</a>
									</Button>

									{isAvailableInCanister(asset) && canisterAssetUrl && (
										<Button
											variant="outline"
											scale="sm"
											className="justify-start hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-200 text-xs"
											asChild
										>
											<a
												href={canisterAssetUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												<ExternalLink className="h-3 w-3 mr-1" />
												Canister
											</a>
										</Button>
									)}
								</div>
							</div>
						</div>
						
						{asset.tags && asset.tags.length > 0 && (
							<div>
								<h3 className="font-medium text-gray-900 dark:text-gray-50 mb-2 flex items-center gap-2 text-sm">
									<span className="w-1 h-4 bg-pink-500 rounded-full"></span>
									Tags
								</h3>
								<div className="flex flex-wrap gap-1.5 bg-white dark:bg-gray-850 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 max-h-[150px] overflow-y-auto">
									{asset.tags.map((tag, index) => (
										<div
											key={index}
											className="bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
										>
											<span className="font-medium text-gray-900 dark:text-gray-100">
												{tag.name}:
											</span>{" "}
											{tag.value}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Fixed footer for actions */}
				<div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900 sticky bottom-0 z-10">
					{canister && !isAvailableInCanister(asset) && (
						<div className="bg-info/25 rounded p-3 shadow-sm flex items-center gap-3">
							<div className="p-1.5 rounded text-info-foreground bg-info/40 flex-shrink-0">
								<Download className="h-5 w-5" />
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-medium text-info text-sm">
									Speed Up Access
								</h4>
								<p className="text-info/80 text-xs truncate">
									Pull to your canister for faster loading
								</p>
							</div>
							<Button
								onClick={handlePullAsset}
								disabled={pulling === asset.id}
								variant="info"
								scale="sm"
							>
								{pulling === asset.id ? (
									<>
										<div className="h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-1" />
										Pulling...
									</>
								) : (
									<>
										<Download className="h-3 w-3 mr-1" />
										Pull to Canister
									</>
								)}
							</Button>
						</div>
					)}

					{canister && isAvailableInCanister(asset) && (
						<div className="bg-constructive/10 rounded border border-constructive/50 p-3 flex justify-between items-center shadow-sm">
							<div className="flex items-center gap-3">
								<div className="bg-constructive/20 p-1.5 rounded text-constructive">
									<svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<h3 className="font-medium text-constructive/80 text-sm">
										Canister Storage Active
									</h3>
									<p className="text-constructive/60 text-xs">
										Stored in your canister for faster access
									</p>
								</div>
							</div>
							<Button
								onClick={handleDeleteAsset}
								disabled={deleting === asset.id}
								variant="outline"
								scale="sm"
								className={
									deleting === asset.id
										? "cursor-not-allowed"
										: "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-all"
								}
							>
								{deleting === asset.id ? (
									<>
										<div className="h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-1" />
										Removing...
									</>
								) : (
									<>
										<Trash2 className="h-3 w-3 mr-1" />
										Remove
									</>
								)}
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AssetDetail;
