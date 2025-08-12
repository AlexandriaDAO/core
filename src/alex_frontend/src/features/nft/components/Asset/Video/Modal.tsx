import React from "react";
import { Video as VideoIcon } from "lucide-react";
import Preview from "./../Preview";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

import useAssetLoading from "../../../hooks/useAssetLoading";

interface VideoModalProps {
	url: string;
	contentType: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ url, contentType }) => {
	const { loading, error, setLoading, setError } = useAssetLoading(url);

	if (error) return <Preview icon={VideoIcon} message={error} />;

	return (
        <div className="w-full h-full place-items-center place-content-center bg-background rounded-lg border boder-border/30 overflow-hidden">
			{loading && <AssetSkeleton />}
			<video
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
					const video = e.target as HTMLVideoElement;
					video.play().finally(() => {
						setLoading(false);
					});
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