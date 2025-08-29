import React, { useEffect } from "react";
import { Image } from "lucide-react";
import Preview from "../Preview";

import useAssetLoading from "../../../hooks/useAssetLoading";
import useImageAnalysis from "../../../hooks/useImageAnalysis";
import { AssetProps } from "../../../types/assetTypes";
import { useNftContext } from "@/components/NftProvider";

const ImageCard: React.FC<AssetProps> = ({ url }) => {
	const { error, setError } = useAssetLoading(url);

	const { safe } = useNftContext();

	const { nsfw } = useImageAnalysis(url, safe);

	if (error) return <Preview icon={<Image size={48} />} title="Loading Error" description={error || "Unable to load image"} />

	return (
		<>
			{/* NSFW Frosted Glass Overlay */}
			{safe && nsfw && (
				<div className="absolute inset-0 z-20 backdrop-blur-lg bg-white/30 dark:bg-black/30 shadow-inner border border-white/40 dark:border-gray-600/40 rounded-md flex items-center justify-center">
					<div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/60 dark:border-gray-500/60">
						<div className="text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-2">
							<div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
							Content Filtered
						</div>
					</div>
				</div>
			)}

			<img
				src={url}
				alt="Asset"
				crossOrigin="anonymous"
				className='max-h-96 h-auto w-auto object-contain transition-all duration-400 group-hover/nft:scale-105'
				onError={() => setError("Unable to load image")}
			/>
		</>
	);
};

export default ImageCard;
