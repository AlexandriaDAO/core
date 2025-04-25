import React, { useState } from "react";
import { Music } from "lucide-react";
import Preview from "./Preview";

type AudioProps = {
	url: string | undefined;
	contentType: string;
};

const Audio: React.FC<AudioProps> = ({ url, contentType }) => {
    const [error, setError] = useState('');

    if(!url || error) return <Preview icon={Music} message={error || "Audio cannot be played"} />;

    return (
        <div className="w-full h-44 flex justify-center items-center">
            <audio
                controls
                className="w-full border rounded-full opacity-50"
                controlsList="nodownload"
                onCanPlay={(e) => {
                    (e.currentTarget as HTMLAudioElement).classList.remove("opacity-50");
                }}
                onError={(e) => {
                    setError("Unable to load audio");
                }}
            >
                <source src={url} type={contentType} />
                Your browser does not support the audio element.
            </audio>
        </div>
    )
}
export default Audio;
