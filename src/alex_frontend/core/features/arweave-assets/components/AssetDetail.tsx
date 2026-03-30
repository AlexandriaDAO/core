import React from "react";
import { ArweaveAssetItem } from "../types";
import { Button } from "@/lib/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/lib/components/dialog";
import { Clock, Download, ExternalLink, FileType, X } from "lucide-react";
import { getFileTypeInfo, getFileTypeName } from "@/features/pinax/constants";
import Copy from "@/components/Copy";
import { selectAsset } from "../arweaveAssetsSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

interface AssetDetailProps {
	asset: ArweaveAssetItem;
}

const AssetDetail: React.FC<AssetDetailProps> = ({ asset }) => {
	const dispatch = useAppDispatch();

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

	const handleClose = () => {
		dispatch(selectAsset(null));
	};

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
									src={asset.url}
									alt="Asset preview"
									className="max-h-[300px] w-full mx-auto object-contain bg-[repeating-conic-gradient(#f5f5f5_0deg,#f5f5f5_8deg,#ffffff_8deg,#ffffff_15deg)] dark:bg-[repeating-conic-gradient(#1f1f1f_0deg,#1f1f1f_8deg,#171717_8deg,#171717_15deg)] p-4"
								/>
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
									<a
										href={asset.url}
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
									src={asset.url}
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
									src={asset.url}
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
									href={asset.url}
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
									href={asset.url}
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
			</DialogContent>
		</Dialog>
	);
};

export default AssetDetail;
