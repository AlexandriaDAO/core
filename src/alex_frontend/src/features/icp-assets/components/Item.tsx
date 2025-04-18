import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { FileText } from "lucide-react";
import { getFileTypeInfo } from "@/features/upload/constants";
import { IcpAssetItem } from "../types";
import { AssetManager } from "@dfinity/assets";
import remove from "../thunks/remove";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

interface ItemProps {
	asset: IcpAssetItem;
	assetManager: AssetManager | null;
}

const Item: React.FC<ItemProps> = ({ asset, assetManager }) => {
	const {userAssetCanister} = useAppSelector(state=>state.assetManager);
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

	return (
		<div className="w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200">
			<div className="h-48 overflow-hidden bg-gray-50 flex items-center justify-center">
				{isImage ? (
					<img 
						src={`http://${userAssetCanister}.localhost:4943${asset.key}`} 
						alt={asset.key}
						className="w-full h-full object-cover"
					/>
				) : isVideo ? (
					<video 
						controls
						className="w-full h-full object-contain"
					>
						<source 
							src={`http://${userAssetCanister}.localhost:4943${asset.key}`} 
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
								src={`http://${userAssetCanister}.localhost:4943${asset.key}`} 
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
						disabled={deleting?.key == asset.key}
						className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded transition-colors duration-200 disabled:opacity-50"
					>
						{deleting?.key == asset.key ? "Deleting..." : "Delete"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Item;