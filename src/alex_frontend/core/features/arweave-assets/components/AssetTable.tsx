import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import {
	ExternalLink,
	Eye,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/lib/components/table";
import { formatFileSize } from "@/features/pinax/utils";
import { getFileTypeInfo, getFileTypeName } from "@/features/pinax/constants";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { selectAsset } from "../arweaveAssetsSlice";
import { fetchUserArweaveAssets } from "../thunks/fetchUserArweaveAssets";
import { ArweaveAssetItem } from "../types";

const AssetTable: React.FC = () => {
	const dispatch = useAppDispatch();
	const { assets: arweaveAssets, loading } = useAppSelector(state => state.arweaveAssets);

	useEffect(() => {
		dispatch(fetchUserArweaveAssets());
	}, []);

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

	if (!arweaveAssets.length) {
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

	// Helper to get file type using the constants
	const getFileTypeDisplay = (contentType?: string) => {
		if (!contentType) return "Unknown";
		const fileTypeInfo = getFileTypeInfo(contentType);
		const typeName = getFileTypeName(contentType);

		return fileTypeInfo ? `${typeName}` : typeName;
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
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{arweaveAssets.map((asset) => (
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
											{getFileTypeInfo(asset.contentType || "")?.icon || (
												<span className="text-xs">
													{getFileTypeName(asset.contentType || "")}
												</span>
											)}
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
										{getFileTypeDisplay(asset.contentType)}
									</span>
								</TableCell>
								<TableCell>
									<span className="text-sm text-gray-500 dark:text-gray-400">
										{asset.size ? formatFileSize(asset.size) : "Unknown"}
									</span>
								</TableCell>
								<TableCell>
									<span className="text-sm text-gray-500 dark:text-gray-400">
										{formatDate(asset.timestamp)}
									</span>
								</TableCell>
								<TableCell>
									<div className="flex items-center space-x-2">
										<Button
											onClick={() => dispatch(selectAsset(asset))}
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
