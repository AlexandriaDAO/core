import React, { useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import Preview from "../Preview";
import { LazyLoadImage } from "react-lazy-load-image-component";
// Remove blur CSS since we're not using the blur effect
// import "react-lazy-load-image-component/src/effects/blur.css";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

// NEW: Import our optimized hooks
import useAssetLoading from "../../../hooks/useAssetLoading";
import { useImageQuery } from "../../../hooks/useImageQuery";
import useNsfwAnalysis from "../../../hooks/useNsfwAnalysis";
import { NsfwAssetProps } from "../../../types/assetTypes";

const ImageCard: React.FC<NsfwAssetProps> = ({ url, checkNsfw, setIsNsfw }) => {
	// Use React Query for caching - auto-fetch enabled
	const { data: cachedUrl, error: queryError } = useImageQuery(url);

	const { error, setError } = useAssetLoading(url);

	// OPTIMIZATION: Use SWR-cached NSFW analysis with 24-hour cache
	const { isNsfw, analyzing } = useNsfwAnalysis(url, "image/jpeg", checkNsfw);

	// Update parent component when NSFW analysis completes
	useEffect(() => {
		if (!analyzing && isNsfw !== undefined) {
			setIsNsfw(isNsfw);
		}
	}, [isNsfw, analyzing, setIsNsfw]);

	// Show error state with consistent UI
	if (error || queryError) return <Preview icon={ImageIcon} message={error || "Unable to load image"} />

	return (
		<LazyLoadImage
			src={cachedUrl || url} // Use cached URL if available, otherwise original
			alt="NFT"
			crossOrigin="anonymous"
			className="w-full min-h-40 max-h-[19rem] rounded-md"
			wrapperClassName="w-full block overflow-hidden rounded-md"
			// Remove blur effect to prevent transition black screen
			// effect="blur"
			// Load immediately - don't wait for viewport
			threshold={0}
			visibleByDefault={true} // Start loading immediately
			delayTime={0} // No delay in showing image
			// Show skeleton while loading
			placeholder={<AssetSkeleton />}
			// Handle successful load
			onLoad={() => {
				// setReady(true);
			}}
			// Handle load errors
			onError={() => {
				setError("Unable to load image");
			}}
		/>
	);
};

export default ImageCard;
