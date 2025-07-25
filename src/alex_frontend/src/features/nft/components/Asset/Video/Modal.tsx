import React from "react";
import { Video as VideoIcon } from "lucide-react";
import Preview from "./../Preview";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

// NEW: Import our optimized hooks
import useAssetLoading from "../../../hooks/useAssetLoading";

interface VideoModalProps {
	url: string;
	contentType: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ url, contentType }) => {
	// NEW: Use unified loading hook with abort signal support
	const { loading, error, setLoading, setError } = useAssetLoading(url);

	// Show error state with consistent UI
	if (error) {
		return <Preview icon={VideoIcon} message={error} />;
	}

	return (
		<div className="relative w-full h-full flex flex-col bg-background">
			{/* Video Display */}
			<div className="flex-1 bg-muted/10 rounded-lg border border-border/30 overflow-hidden relative">
				<div className="w-full h-full flex items-center justify-center">
					{loading && <AssetSkeleton />}
					<video
						controls
						autoPlay
						className={`max-w-full max-h-full object-contain rounded-lg shadow-lg ${loading ? 'hidden' : ''}`}
						controlsList="nodownload"
						preload="metadata"  // Keep metadata for modal - user wants to watch
						playsInline
						style={{
							width: 'auto',
							height: 'auto'
						}}
						onCanPlay={(e) => {
							const video = e.target as HTMLVideoElement;
							video.play().catch(() => {
								// Handle autoplay restrictions gracefully
								setLoading(false);
							});
							setLoading(false);
						}}
						onError={() => {
							setError("Unable to load video");
							setLoading(false);
						}}
						onLoadStart={() => {
							// Modal should start fresh - don't inherit card's cancellation state
						}}
					>
						<source src={url} type={contentType} />
						Your browser does not support the video tag.
					</video>
				</div>
			</div>
		</div>
	);
};

export default VideoModal;