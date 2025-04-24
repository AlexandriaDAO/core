import React, { useState } from "react";
import { Video as VideoIcon } from "lucide-react";
import Preview from "./Preview";

type VideoProps = {
	url: string | undefined;
	contentType: string;
};

const Video: React.FC<VideoProps> = ({ url, contentType }) => {
    const [error, setError] = useState('')
    if(!url || error) return <Preview icon={VideoIcon} message={error || "Video cannot be played"} />;

    return (
        <video
            controls
            className="w-full object-contain rounded-md"
            controlsList="nodownload"
            onError={(e) => {
                setError("Unable to load video");
            }}
        >
            <source src={url} type={contentType} />
            Your browser does not support the video tag.
        </video>
    )
}

export default Video;
