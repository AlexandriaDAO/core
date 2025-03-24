import React, { useEffect, useState } from "react";
import { useAssetCanister } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";

// Asset Item Component
interface ItemProps {
	asset: {
		key: string;
		content_type: string;
	};
}

const Item: React.FC<ItemProps> = ({ asset }) => {
	const {userAssetCanister} = useAppSelector(state=>state.assetManager);

	const [isDeleting, setIsDeleting] = useState(false);
	const [isDeleted, setIsDeleted] = useState(false);
	const { actor } = useAssetCanister();

	// useEffect(() => {
	// 	const fetchAsset = async () => {
	// 		setLoading(true);
	// 		try {
	// 			const assetUrl = `http://br5f7-7uaaa-aaaaa-qaaca-cai.localhost:4943${asset.key}`;
				
	// 			// Use fetch API for progress tracking
	// 			const response = await fetch(assetUrl);
	// 			const contentLength = response.headers.get('Content-Length');
	// 			const total = contentLength ? parseInt(contentLength, 10) : 0;
	// 			let loaded = 0;
				
	// 			// Create reader from response body
	// 			const reader = response.body?.getReader();
	// 			const chunks: Uint8Array[] = [];
				
	// 			// Process stream
	// 			if (reader) {
	// 				while (true) {
	// 					const { done, value } = await reader.read();
	// 					if (done) break;
						
	// 					chunks.push(value);
	// 					loaded += value.length;
						
	// 					if (total > 0) {
	// 						setDownloadProgress(Math.round((loaded / total) * 100));
	// 					}
	// 				}
	// 			}
				
	// 			// Combine chunks into a single blob
	// 			const blob = new Blob(chunks, { type: asset.content_type });
	// 			const objectUrl = URL.createObjectURL(blob);
	// 			setUrl(objectUrl);
	// 		} catch (error) {
	// 			console.error(`Failed to fetch asset: ${asset.key}`, error);
	// 		} finally {
	// 			setLoading(false);
	// 			setDownloadProgress(null);
	// 		}
	// 	};

	// 	fetchAsset();
	// 	// Cleanup function remains the same...
	// }, [asset.key]);

	const handleDelete = async () => {
		if (!actor) return;

		try {
			setIsDeleting(true);
			// Call the delete_asset method from the asset canister
			await actor.delete_asset({ key: asset.key });

			setIsDeleted(true);
		} catch (error) {
			console.error("Failed to delete asset:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	// If the asset has been deleted, don't render the card
	if (isDeleted) {
		return null;
	}

	return (
		<div className="w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 m-2">
			{/* {loading ? (
				<div className="h-48 flex flex-col items-center justify-center bg-gray-100">
					<p className="text-gray-500 mb-2">Loading...</p>
					{downloadProgress !== null && (
						<>
							<div className="w-3/4 bg-gray-200 rounded-full h-2 mb-1">
								<div
									className="bg-blue-500 h-2 rounded-full transition-all duration-300"
									style={{ width: `${downloadProgress}%` }}
								/>
							</div>
							<p className="text-xs text-gray-500">{downloadProgress}%</p>
						</>
					)}
				</div>
			) : (
				<>
					{url && isImage ? (
						<div className="h-48 overflow-hidden">
							<img 
								src={`http://${userAssetCanister}.localhost:4943${asset.key}`} 
								alt={asset.key}
								className="w-full h-full object-cover"
							/>
						</div>
					) : (
						<div className="h-48 flex items-center justify-center bg-gray-100">
							<div className="text-3xl font-bold text-gray-400">{fileExtension}</div>
						</div>
					)}
				</>
			)} */}

			<div className="h-48 overflow-hidden">
				<img 
					src={`http://${userAssetCanister}.localhost:4943${asset.key}`} 
					alt={asset.key}
					className="w-full h-full object-cover"
				/>
			</div>

			<div className="p-4">
				<h3 className="text-lg font-semibold text-gray-800 truncate" title={asset.key}>{asset.key}</h3>

				<div className="mt-3 text-sm text-gray-600 space-y-1">
					<div className="flex items-center">
						<span className="font-medium mr-2">Type:</span> 
						<span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
							{asset.content_type}
						</span>
					</div>
				</div>

				<div className="mt-4 flex justify-between items-center">
					<a 
						href={`http://${userAssetCanister}.localhost:4943${asset.key}`} 
						target="_blank" 
						rel="noopener noreferrer" 
						className="text-sm text-blue-600 hover:text-blue-800 font-medium"
					>
						View File
					</a>

					<button 
						onClick={handleDelete}
						disabled={isDeleting}
						className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded transition-colors duration-200 disabled:opacity-50"
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Item;