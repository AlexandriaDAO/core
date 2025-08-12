import React, { useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import Preview from "../Preview";

// NEW: Import our optimized hooks
import useAssetLoading from "../../../hooks/useAssetLoading";
import useImageAnalysis from "../../../hooks/useImageAnalysis";
import { NsfwAssetProps } from "../../../types/assetTypes";

const ImageCard: React.FC<NsfwAssetProps> = ({ url, checkNsfw, setIsNsfw }) => {
	const { error, setError } = useAssetLoading(url);

	const { nsfw, analyzing } = useImageAnalysis(url, checkNsfw);

	useEffect(() => {
		if (!analyzing && nsfw) {
			setIsNsfw(nsfw);
		}
	}, [nsfw, analyzing, setIsNsfw]);

	// Show error state with consistent UI
	if (error) return <Preview icon={ImageIcon} message={error || "Unable to load image"} />

	return (
		<img
			src={url}
			alt="Asset"
			crossOrigin="anonymous"
			className='max-h-96 h-auto w-auto object-contain transition-all duration-400 group-hover/nft:scale-105'
			onError={() => setError("Unable to load image")}
		/>
	);
};

export default ImageCard;
