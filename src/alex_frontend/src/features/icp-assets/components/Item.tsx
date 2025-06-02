import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { FileText } from "lucide-react";
import { getFileTypeInfo } from "@/features/pinax/constants";
import { IcpAssetItem } from "../types";
import { AssetManager } from "@dfinity/assets";
import remove from "../thunks/remove";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Button } from "@/lib/components/button";

const isLocal = process.env.DFX_NETWORK == "local";

interface ItemProps {
	asset: IcpAssetItem;
	assetManager: AssetManager | null;
}

const Item: React.FC<ItemProps> = ({ asset, assetManager }) => {
	const {canister} = useAppSelector(state=>state.auth);
	const dispatch = useAppDispatch();
	const {deleting} = useAppSelector(state=>state.icpAssets);

	const handleDelete = async () => {
		if (!assetManager) return;

		dispatch(remove({ asset, assetManager }));
	};

	const fileTypeInfo = getFileTypeInfo(asset.content_type);
	const isImage = fileTypeInfo?.label === 'Images';
	const isVideo = fileTypeInfo?.label === 'Media' && asset.content_type.startsWith('video');
	const isAudio = fileTypeInfo?.label === 'Media' && asset.content_type.startsWith('audio');
	const isDocument = fileTypeInfo?.label === 'Documents' || fileTypeInfo?.label === 'E-books';

	// Generate canister asset URL
	const getCanisterAssetUrl = () => {
		if (!canister) return "";
		const baseUrl = isLocal ? `http://${canister}.localhost:4943` : `https://${canister}.raw.icp0.io`;
		return baseUrl + asset.key;
	};

	return (
		<div className="w-64 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-ring">
			<div className="h-48 overflow-hidden bg-gray-50 flex items-center justify-center">
				{isImage ? (
					<img 
						src={getCanisterAssetUrl()} 
						alt={asset.key}
						className="w-full h-full object-cover"
					/>
				) : isVideo ? (
					<video 
						controls
						className="w-full h-full object-contain"
					>
						<source 
							src={getCanisterAssetUrl()} 
							type={asset.content_type}
						/>
						Your browser does not support the video tag.
					</video>
				) : isAudio ? (
					<div className="w-full p-4">
						<audio 
							controls
							className="w-full"
						>
							<source 
								src={getCanisterAssetUrl()} 
								type={asset.content_type}
							/>
							Your browser does not support the audio element.
						</audio>
					</div>
				) : isDocument ? (
					<div className="flex flex-col justify-center items-center gap-2">
						{fileTypeInfo?.icon}
						<p className="mt-2 text-sm text-gray-600">{fileTypeInfo?.label}</p>
					</div>
				) : (
					<div className="flex flex-col justify-center items-center gap-2">
						<FileText className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
						<p className="mt-2 text-sm text-gray-600">File</p>
					</div>
				)}
			</div>

			<div className="p-4">
				<h3 className="text-lg font-semibold truncate" title={asset.key}>{asset.key}</h3>

				<div className="mt-3 text-sm text-gray-600 space-y-1">
					<div className="flex items-center">
						<span className="font-medium mr-2">Type:</span> 
						<span className="bg-info/10 dark:bg-white/80 text-info/60 dark:text-black px-2 py-0.5 rounded-full text-xs">
							{asset.content_type}
						</span>
					</div>
				</div>

				<div className="mt-4 flex justify-between items-center">
					<a 
						href={getCanisterAssetUrl()} 
						target="_blank" 
						rel="noopener noreferrer" 
						className="text-sm text-primary/80 hover:text-primary font-medium"
					>
						View File
					</a>
					<Button variant="warning" scale="sm" onClick={handleDelete} disabled={deleting?.key == asset.key}>
						{deleting?.key == asset.key ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Item;