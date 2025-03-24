import React, { useEffect, useState } from "react";
import { AssetItem } from "../types";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useInternetIdentity } from "ic-use-internet-identity";
import { toast } from "sonner";
import { Button } from "@/lib/components/button";
import {
	Check,
	Cloud,
	CloudOff,
	Download,
	ExternalLink,
	Eye,
	Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/lib/components/table";
import { useAssetManager } from "@/hooks/useAssetManager";
import { fetchFile, uploadToCanister } from "../utils/assetUtils";
import { Alert } from "@/components/Alert";

interface AssetTableProps {
	assets: AssetItem[];
	loading: boolean;
	onSelectAsset: (asset: AssetItem) => void;
}

const AssetTable: React.FC<AssetTableProps> = ({
	assets,
	loading,
	onSelectAsset,
}) => {
	const { userAssetCanister } = useAppSelector((state) => state.assetManager);
	const { identity } = useInternetIdentity();
	const [assetAvailability, setAssetAvailability] = useState<Record<string, boolean>>({});
	const [pullInProgress, setPullInProgress] = useState<Record<string, boolean>>({});

	// Use our custom hook to get the asset manager
	const assetManager = useAssetManager({
		canisterId: userAssetCanister ?? undefined,
		identity
	});

	// Check which assets are already in the user's canister
	useEffect(() => {
		const checkAssetAvailability = async () => {
			if (!assetManager || assets.length === 0) return;

			try {
				// Get list of assets from canister
				const canisterAssets = await assetManager.list();
				const assetKeysInCanister = new Set(
					canisterAssets.map((asset) => asset.key)
				);

				// Check each asset
				const availability = assets.reduce((acc, asset) => {
					// We'll store assets with their id as the key
					const assetKey = `/arweave/${asset.id}`;
					acc[asset.id] = assetKeysInCanister.has(assetKey);
					return acc;
				}, {} as Record<string, boolean>);

				setAssetAvailability(availability);
			} catch (error) {
				console.error("Failed to check asset availability:", error);
			}
		};

		checkAssetAvailability();
	}, [assetManager, assets]);

	// Function to pull asset to user's canister
	const pullAssetToCanister = async (asset: AssetItem) => {
		if (!assetManager) {
			toast.error(
				"No asset canister available. Please create one first."
			);
			return;
		}

		try {
			setPullInProgress({ ...pullInProgress, [asset.id]: true });

			// Fetch the file using our utility function
			const file = await fetchFile(asset);
			
			// Upload the file using our utility function
			await uploadToCanister(assetManager, file, asset.id);

			// Update availability state
			setAssetAvailability({
				...assetAvailability,
				[asset.id]: true,
			});

			toast.success(
				`Asset ${asset.id} pulled to your canister successfully`
			);
		} catch (error) {
			console.error("Failed to pull asset to canister:", error);
			toast.error(
				`Failed to pull asset: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		} finally {
			setPullInProgress({ ...pullInProgress, [asset.id]: false });
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center p-8 text-gray-500 dark:text-gray-400">
				<div className="flex flex-col items-center">
					<div className="h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-gray-500 dark:border-t-gray-400 rounded-full animate-spin mb-4"></div>
					<p>Loading assets...</p>
				</div>
			</div>
		);
	}

	if (!assets.length) {
		return (
			<div className="flex justify-center p-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-800">
				<div className="text-center">
					<h3 className="font-medium text-gray-900 dark:text-gray-50 mb-2">
						No assets found
					</h3>
					<p className="max-w-md">
						You don't have any assets yet. Assets will appear here
						after you mint NFTs.
					</p>
				</div>
			</div>
		);
	}

	// Helper function to format timestamp
	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "Unknown";
		return new Date(timestamp * 1000).toLocaleString();
	};

	// Helper to get file type from content type
	const getFileType = (contentType?: string) => {
		if (!contentType) return "Unknown";
		if (contentType.includes("image")) return "Image";
		if (contentType.includes("video")) return "Video";
		if (contentType.includes("audio")) return "Audio";
		if (contentType.includes("pdf")) return "PDF";
		if (contentType.includes("text")) return "Text";
		if (contentType.includes("json")) return "JSON";
		return contentType.split("/")[1] || contentType;
	};

	// Helper to format file size
	const formatSize = (bytes?: number) => {
		if (!bytes) return "Unknown";
		const sizes = ["Bytes", "KB", "MB", "GB"];
		if (bytes === 0) return "0 Byte";
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
	};

	return (
		<div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Preview</TableHead>
							<TableHead>Asset ID</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Size</TableHead>
							<TableHead>Created</TableHead>
							<TableHead>Storage</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{assets.map((asset) => (
							<TableRow key={asset.id}>
								<TableCell>
									{asset.contentType?.includes("image") ? (
										<img
											src={asset.url}
											alt="Asset preview"
											className="h-12 w-12 object-cover rounded"
											onError={(e) => {
												(
													e.target as HTMLImageElement
												).src = "/placeholder.png";
											}}
										/>
									) : (
										<div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
											<span className="text-xs">
												{getFileType(asset.contentType)}
											</span>
										</div>
									)}
								</TableCell>
								<TableCell>
									<span className="text-sm text-gray-900 dark:text-gray-100 font-mono truncate max-w-xs inline-block">
										{asset.id.substring(0, 12)}...
									</span>
								</TableCell>
								<TableCell>
									<span className="text-sm text-gray-500 dark:text-gray-400">
										{getFileType(asset.contentType)}
									</span>
								</TableCell>
								<TableCell>
									<span className="text-sm text-gray-500 dark:text-gray-400">
										{formatSize(asset.size)}
									</span>
								</TableCell>
								<TableCell>
									<span className="text-sm text-gray-500 dark:text-gray-400">
										{formatDate(asset.timestamp)}
									</span>
								</TableCell>
								<TableCell>
									{!userAssetCanister ? (
										<Alert title="No Canister" className="px-2 py-0 m-0 flex justify-start items-center rounded-full" icon={CloudOff} children={null}></Alert>
									) : assetAvailability[asset.id] ? (
										<Alert variant="success" title="In Canister" className="px-2 py-0 m-0 flex justify-start items-center rounded-full" icon={Check} children={null}></Alert>
									) : pullInProgress[asset.id] ? (
										<Alert variant="info" title="Pulling..." className="px-2 py-0 m-0 flex justify-start items-center rounded-full" icon={Download} children={null}></Alert>
									) : (
										<Alert variant="warning" title="Arweave only" className="px-2 py-0 m-0 flex justify-start items-center rounded-full" icon={Cloud} children={null}></Alert>
									)}
								</TableCell>
								<TableCell>
									<div className="flex items-center space-x-2">
										<Button
											onClick={() => onSelectAsset(asset)}
											variant="muted"
											scale="sm"
											className="gap-1"
										>
											<Eye size={16}/>
											View
										</Button>

										<Button
											variant="muted"
											scale="sm"
											className="gap-1"
											asChild
										>
											<a
												href={asset.url}
												target="_blank"
												rel="noopener noreferrer"
											>
												<ExternalLink size={16}/>
												Open
											</a>
										</Button>

										{userAssetCanister &&
											!assetAvailability[asset.id] &&
											!pullInProgress[asset.id] && (
												<Button
													onClick={() =>
														pullAssetToCanister(
															asset
														)
													}
													variant="outline"
													scale="sm"
												>
													<Download size={16} />
													Pull
												</Button>
											)}

										{!userAssetCanister && (
											<Button
												variant="link"
												scale="sm"
												asChild
											>
												<Link to="/dashboard/settings">
													Create Canister
												</Link>
											</Button>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};

export default AssetTable;
