import React, { useEffect, useRef } from "react";
import { Video as VideoIcon, Play } from "lucide-react";
import Preview from "./../Preview";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

// NEW: Import our optimized hooks
import useAssetLoading from "../../../hooks/useAssetLoading";
import useNsfwAnalysis from "../../../hooks/useNsfwAnalysis";
import { VideoAssetProps } from "../../../types/assetTypes";

const VideoCard: React.FC<VideoAssetProps> = ({ url, contentType, checkNsfw, setIsNsfw }) => {
	// NEW: Use unified loading hook with abort signal support
	const { loading, error, ready, setLoading, setError, setReady } = useAssetLoading(url);

	// OPTIMIZATION: Use SWR-cached NSFW analysis with 24-hour cache
	// Start NSFW analysis immediately when Safe Search is ON - no need to wait for video load
	const { isNsfw, analyzing } = useNsfwAnalysis(url, contentType, checkNsfw);
	// const { isNsfw, analyzing } = useNsfwAnalysis("/video/1.mp4", contentType, checkNsfw);

	const videoRef = useRef<HTMLVideoElement>(null);

	// Update parent component when NSFW analysis completes
	useEffect(() => {
		if (!analyzing && isNsfw !== undefined) {
			setIsNsfw(isNsfw);
		}
	}, [isNsfw, analyzing, setIsNsfw]);

	// Show error state with consistent UI
	if (error) {
		return <Preview icon={VideoIcon} message={error} />;
	}

	return (
		<>
			{loading && <AssetSkeleton />}
			<div className={`relative w-full h-full bg-black/5 rounded-md overflow-hidden group ${loading ? 'hidden' : ''}`}>
				{/* Video - OPTIMIZED: preload="metadata" for thumbnail but no auto download */}
				<video
					ref={videoRef}
					className="w-full h-full object-cover max-w-full max-h-[19rem]"
					preload="metadata"  // CHANGED: Back to "metadata" so loading events fire
					muted
					playsInline
					crossOrigin="anonymous"
					onError={() => {
						setError("Unable to load video");
						setLoading(false);
					}}
					onLoadedMetadata={(e) => {
						// Video metadata loaded - stop loading skeleton
						setLoading(false);
						setReady(true);

						const video = e.target as HTMLVideoElement;
						// Set to 1 second for thumbnail, but don't download full video
						if (video.duration > 0) {
							video.currentTime = Math.min(1, video.duration * 0.1);
						}
					}}
					onLoadedData={(e) => {
						const video = e.target as HTMLVideoElement;
						video.pause(); // Ensure video stays paused
					}}
					// onSeeked={() => {
					// 	// Video seek completed - thumbnail ready
					// 	// REMOVED: Already setting ready in onLoadedMetadata
					// }}
				>
					<source src={url} type={contentType} />
				</video>

				{/* Play Button Overlay */}
				<div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
					<div className="bg-white/90 rounded-full p-3 shadow-lg">
						<Play className="h-6 w-6 text-black fill-black ml-0.5" />
					</div>
				</div>
			</div>
		</>
	);
};

export default VideoCard;