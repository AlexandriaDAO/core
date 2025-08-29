import React, { useEffect } from "react";
import { Video, Play } from "lucide-react";
import Preview from "./../Preview";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

import useAssetLoading from "../../../hooks/useAssetLoading";
import { VideoAssetProps } from "../../../types/assetTypes";
import useVideoAnalysis from "@/features/nft/hooks/useVideoAnalysis";
import { useNftContext } from "@/components/NftProvider";

const VideoCard: React.FC<VideoAssetProps> = ({ url, contentType }) => {
	const { loading, setLoading, error, setError } = useAssetLoading(url);

	const { safe } = useNftContext();

	const { nsfw } = useVideoAnalysis(url, safe);

	if (error) return <Preview icon={<Video size={48} />} title="Loading Error" description={error || 'Unable to load Video'} />;

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

			{loading && <AssetSkeleton />}

			<div className={`relative w-full h-full bg-black/5 rounded-md overflow-hidden group ${loading ? 'hidden' : ''}`}>
				<video
					className="w-full h-full object-cover max-w-full max-h-[19rem]"
					preload="metadata"
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