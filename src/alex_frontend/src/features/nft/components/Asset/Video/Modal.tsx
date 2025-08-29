import React, { useEffect, useRef } from "react";
import { Loader, Video } from "lucide-react";
import Preview from "./../Preview";

import useAssetLoading from "../../../hooks/useAssetLoading";
import { useNftContext } from "@/components/NftProvider";
import useVideoAnalysis from "@/features/nft/hooks/useVideoAnalysis";

interface VideoModalProps {
	url: string;
	contentType: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ url, contentType }) => {
	const { loading, error, setLoading, setError } = useAssetLoading(url);
	const videoRef = useRef<HTMLVideoElement>(null)

	const { safe } = useNftContext();

	const { nsfw } = useVideoAnalysis(url, safe);

	useEffect(()=>{
		if(!videoRef.current || !safe || !nsfw) return;

		videoRef.current.pause();
	}, [nsfw, safe])

	if (error) return <Preview icon={<Video size={48} />} title="Loading Error" description={error || 'Unable to load Video'} />;

	return (
        <div className="relative w-full h-full place-items-center place-content-center bg-background rounded-lg border boder-border/30 overflow-hidden">
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

			{loading &&
				<div className="relative min-h-40 h-full w-full place-items-center place-content-center">
					<Loader className="animate-spin" />
				</div>
			}

			<video
				ref={videoRef}
				controls
				autoPlay
				className={`max-w-full max-h-full object-contain rounded-lg shadow-lg ${loading ? 'hidden' : ''}`}
				controlsList="nodownload"
				preload="metadata"
				playsInline
				style={{
					width: 'auto',
					height: 'auto'
				}}
				onCanPlay={(e) => {
					setLoading(false);
					const video = e.target as HTMLVideoElement;
					if(!nsfw) video.play();
				}}
				onError={() => {
					setError("Unable to load video");
					setLoading(false);
				}}
			>
				<source src={url} type={contentType} />
				Your browser does not support the video tag.
			</video>
		</div>
	);
};

export default VideoModal;