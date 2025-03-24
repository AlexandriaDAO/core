import React, { useEffect, useState } from "react";
import { AssetItem } from "../types";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useInternetIdentity } from "ic-use-internet-identity";
import { toast } from "sonner";
import { Button } from "@/lib/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/lib/components/dialog";
import { Alert } from "@/components/Alert";
import { Clock, Download, ExternalLink, FileType, Trash2 } from "lucide-react";
import { fetchFile, uploadToCanister } from "../utils/assetUtils";
import { useAssetManager } from "@/hooks/useAssetManager";

interface AssetDetailProps {
	asset: AssetItem;
	onClose: () => void;
}

const AssetDetail: React.FC<AssetDetailProps> = ({ asset, onClose }) => {
	const { userAssetCanister } = useAppSelector((state) => state.assetManager);
	const { identity } = useInternetIdentity();
	const [isInCanister, setIsInCanister] = useState<boolean>(false);
	const [isPulling, setIsPulling] = useState<boolean>(false);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

	// Use our custom hook to get the asset manager
	const assetManager = useAssetManager({
		canisterId: userAssetCanister ?? undefined,
		identity,
		maxSingleFileSize: 1_900_000,
		maxChunkSize: 500_000,
	});

	// Check if asset is in canister
	useEffect(() => {
		const checkAssetAvailability = async () => {
			if (!assetManager) {
				setLoadingStatus(false);
				return;
			}

			try {
				// Get list of assets from canister
				const canisterAssets = await assetManager.list();
				const assetKey = `/arweave/${asset.id}`;
				const found = canisterAssets.some(
					(canisterAsset) => canisterAsset.key === assetKey
				);

				setIsInCanister(found);
			} catch (error) {
				console.error("Failed to check asset availability:", error);
			} finally {
				setLoadingStatus(false);
			}
		};

		checkAssetAvailability();
	}, [assetManager, asset.id]);

	// Function to pull asset to user's canister
	const pullAssetToCanister = async () => {
		if (!assetManager) {
			toast.error("No asset canister available. Please create one first.");
			return;
		}
		
		try {
			setIsPulling(true);
			
			// Fetch the file using our utility function
			const file = await fetchFile(asset);
			
			// Upload the file using our utility function
			await uploadToCanister(assetManager, file, asset.id);
			
			setIsInCanister(true);
			toast.success(`Asset ${asset.id} pulled to your canister successfully`);
		} catch (error) {
			console.error("Failed to pull asset to canister:", error);
			toast.error(`Failed to pull asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setIsPulling(false);
		}
	};

	// Function to delete asset from user's canister
	const deleteAssetFromCanister = async () => {
		if (!assetManager) {
			toast.error("No asset canister available.");
			return;
		}

		// Confirm deletion
		if (
			!window.confirm(
				`Are you sure you want to delete this asset from your canister?\nThis won't delete it from Arweave.`
			)
		) {
			return;
		}

		try {
			setIsDeleting(true);

			// Delete the asset
			const assetKey = `/arweave/${asset.id}`;
			const batch = assetManager.batch();
			await batch.delete(assetKey);
			await batch.commit();

			setIsInCanister(false);
			toast.success(
				`Asset ${asset.id} deleted from your canister successfully`
			);
		} catch (error) {
			console.error("Failed to delete asset from canister:", error);
			toast.error(
				`Failed to delete asset: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		} finally {
			setIsDeleting(false);
		}
	};

	// Helper function to format timestamp
	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "Unknown";
		return new Date(timestamp * 1000).toLocaleString();
	};

	// Get title and description from tags
	const title = asset.tags?.find((tag) => tag.name === "Title")?.value || "Untitled Asset";
	const description = asset.tags?.find((tag) => tag.name === "Description")?.value || "No description available";

	// Determine if the asset is an image to render it
	const isImage = asset.contentType?.includes("image");
	const isVideo = asset.contentType?.includes("video");
	const isAudio = asset.contentType?.includes("audio");

	// Generate canister asset URL
	const getCanisterAssetUrl = () => {
		if (!userAssetCanister) return "";
		const isLocal = !window.location.host.endsWith("ic0.app");
		const baseUrl = isLocal
			? `http://${userAssetCanister}.localhost:4943`
			: `https://${userAssetCanister}.ic0.app`;
		return `${baseUrl}/arweave/${asset.id}`;
	};

	const canisterAssetUrl = getCanisterAssetUrl();

	return (
		<Dialog open onOpenChange={() => onClose()}>
			<DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
				<DialogHeader className="p-6 pb-0">
					<DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">
						{title}
					</DialogTitle>
				</DialogHeader>

				<div className="p-6">
					<div className="mb-6 bg-white dark:bg-gray-850 rounded-lg p-4 shadow-sm">
						{isImage && (
							<img
								src={
									isInCanister && canisterAssetUrl
										? canisterAssetUrl
										: asset.url
								}
								alt={title}
								className="max-h-96 max-w-full mx-auto rounded object-contain"
							/>
						)}
						{isVideo && (
							<video
								src={
									isInCanister && canisterAssetUrl
										? canisterAssetUrl
										: asset.url
								}
								controls
								className="max-h-96 max-w-full mx-auto rounded"
							>
								Your browser does not support the video tag.
							</video>
						)}
						{isAudio && (
							<audio
								src={
									isInCanister && canisterAssetUrl
										? canisterAssetUrl
										: asset.url
								}
								controls
								className="w-full mx-auto"
							>
								Your browser does not support the audio tag.
							</audio>
						)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div>
							<h3 className="font-medium text-gray-900 dark:text-gray-50 mb-3">
								Description
							</h3>
							<p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-850 p-4 rounded-lg shadow-sm">
								{description}
							</p>

							{asset.tags && asset.tags.length > 0 && (
								<div className="mt-6">
									<h3 className="font-medium text-gray-900 dark:text-gray-50 mb-3">
										Tags
									</h3>
									<div className="flex flex-wrap gap-2 bg-white dark:bg-gray-850 p-4 rounded-lg shadow-sm">
										{asset.tags.map((tag, index) => (
											<div
												key={index}
												className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm"
											>
												<span className="font-medium">
													{tag.name}:
												</span>{" "}
												{tag.value}
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						<div>
							<h3 className="font-medium text-gray-900 dark:text-gray-50 mb-3">
								Asset Details
							</h3>
							<div className="bg-white dark:bg-gray-850 p-4 rounded-lg shadow-sm">
								<ul className="space-y-3 text-sm">
									<li className="flex items-start gap-2">
										<FileType className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
										<div>
											<span className="block text-xs text-gray-500 dark:text-gray-400">
												Type
											</span>
											<span className="text-gray-900 dark:text-gray-50">
												{asset.contentType || "Unknown"}
											</span>
										</div>
									</li>

									<li className="flex items-start gap-2">
										<Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
										<div>
											<span className="block text-xs text-gray-500 dark:text-gray-400">
												Created
											</span>
											<span className="text-gray-900 dark:text-gray-50">
												{formatDate(asset.timestamp)}
											</span>
										</div>
									</li>

									<li className="flex items-start gap-2">
										<div className="h-5 w-5 flex-shrink-0 flex items-center justify-center">
											{loadingStatus ? (
												<div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
											) : isInCanister ? (
												<div className="h-3 w-3 bg-green-500 rounded-full" />
											) : (
												<div className="h-3 w-3 bg-yellow-500 rounded-full" />
											)}
										</div>
										<div>
											<span className="block text-xs text-gray-500 dark:text-gray-400">
												Storage
											</span>
											{loadingStatus ? (
												<span className="text-gray-400">
													Checking...
												</span>
											) : isInCanister ? (
												<span className="text-green-600 dark:text-green-500">
													Available in your canister
												</span>
											) : (
												<span className="text-yellow-600 dark:text-yellow-500">
													Arweave only
												</span>
											)}
										</div>
									</li>
								</ul>

								<div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
									<Button
										variant="outline"
										scale="sm"
										className="justify-start"
										asChild
									>
										<a
											href={asset.url}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="h-4 w-4 mr-2" />
											View on Arweave
										</a>
									</Button>

									{isInCanister && canisterAssetUrl && (
										<Button
											variant="outline"
											scale="sm"
											className="justify-start"
											asChild
										>
											<a
												href={canisterAssetUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												<ExternalLink className="h-4 w-4 mr-2" />
												View in Canister
											</a>
										</Button>
									)}
								</div>
							</div>

							{isInCanister && canisterAssetUrl && (
								<div className="mt-4">
									<h4 className="font-medium text-gray-900 dark:text-gray-50 mb-2 text-sm">
										Canister URL
									</h4>
									<div className="bg-white dark:bg-gray-850 p-3 rounded-lg text-sm break-all border border-gray-200 dark:border-gray-800 font-mono">
										{canisterAssetUrl}
									</div>
								</div>
							)}
						</div>
					</div>

					{userAssetCanister && !isInCanister && !loadingStatus && (
						<Alert
							// variant="info"
							title="Speed Up Access"
							className="mt-6"
						>
							<p className="text-sm mb-3">
								This asset is stored on Arweave. Pull it to your
								canister for faster loading.
							</p>
							<Button
								onClick={pullAssetToCanister}
								disabled={isPulling}
								variant={isPulling ? "outline" : "primary"}
								className={
									isPulling ? "cursor-not-allowed" : ""
								}
							>
								{isPulling ? (
									<>
										<div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
										Pulling to Canister...
									</>
								) : (
									<>
										<Download className="h-4 w-4 mr-2" />
										Pull to Canister
									</>
								)}
							</Button>
						</Alert>
					)}

					{userAssetCanister && isInCanister && !loadingStatus && (
						<div className="mt-6 p-4 bg-gray-100 dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-800 flex justify-between items-center">
							<div>
								<h3 className="font-medium text-gray-900 dark:text-gray-50 mb-1">
									Canister Storage
								</h3>
								<p className="text-gray-700 dark:text-gray-300 text-sm">
									This asset is stored in your canister for
									faster access.
								</p>
							</div>
							<Button
								onClick={deleteAssetFromCanister}
								disabled={isDeleting}
								variant="outline"
								className={
									isDeleting
										? "cursor-not-allowed"
										: "text-destructive/80 hover:bg-red-50 hover:text-destructive"
								}
							>
								{isDeleting ? (
									<>
										<div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
										Removing...
									</>
								) : (
									<>
										<Trash2 className="h-4 w-4 mr-2" />
										Remove from Canister
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
