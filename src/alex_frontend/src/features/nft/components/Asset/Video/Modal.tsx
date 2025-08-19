import React from "react";
import { Loader, Video } from "lucide-react";
import Preview from "./../Preview";

import useAssetLoading from "../../../hooks/useAssetLoading";

interface VideoModalProps {
	url: string;
	contentType: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ url, contentType }) => {
	const { loading, error, setLoading, setError } = useAssetLoading(url);

	if (error) return <Preview icon={<Video size={48} />} title="Loading Error" description={error || 'Unable to load Video'} />;

	return (
        <div className="w-full h-full place-items-center place-content-center bg-background rounded-lg border boder-border/30 overflow-hidden">
			{loading &&
				<div className="relative min-h-40 h-full w-full place-items-center place-content-center">
					<Loader className="animate-spin" />
				</div>
			}

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
					setLoading(false);
					const video = e.target as HTMLVideoElement;
					video.play();
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