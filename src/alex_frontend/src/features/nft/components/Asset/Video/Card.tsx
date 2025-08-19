import React, { useEffect } from "react";
import { Video, Play } from "lucide-react";
import Preview from "./../Preview";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

import useAssetLoading from "../../../hooks/useAssetLoading";
import { VideoAssetProps } from "../../../types/assetTypes";
import useVideoAnalysis from "@/features/nft/hooks/useVideoAnalysis";

const VideoCard: React.FC<VideoAssetProps> = ({ url, contentType, checkNsfw, setIsNsfw }) => {
	const { loading, setLoading, error, setError } = useAssetLoading(url);
	const { nsfw, analyzing } = useVideoAnalysis(url, checkNsfw);

	// Update parent component when NSFW analysis completes
	useEffect(() => {
		if (!analyzing && nsfw) {
			setIsNsfw(nsfw);
		}
	}, [nsfw, analyzing, setIsNsfw]);

	if (error) return <Preview icon={<Video size={48} />} title="Loading Error" description={error || 'Unable to load Video'} />;

	return (
		<>
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