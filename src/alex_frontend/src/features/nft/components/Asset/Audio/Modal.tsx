import React, { useState } from "react";
import { Music } from "lucide-react";
import Preview from "../Preview";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

// NEW: Import our optimized hooks and types
import useAssetLoading from "../../../hooks/useAssetLoading";
import { AudioAssetProps } from "../../../types/assetTypes";

const AudioModal: React.FC<AudioAssetProps> = ({ url, contentType }) => {
    // NEW: Use unified loading hook with abort signal support
    const { loading, error, setLoading, setError } = useAssetLoading(url);
    const [localError, setLocalError] = useState('');

    // Show error state with consistent UI
    if (error || localError) {
        return <Preview icon={Music} message={error || localError || "Audio cannot be played"} />;
    }

    return (
        <div className="w-full h-full">
            {/* Loading State */}
            {loading && <AssetSkeleton />}
            
            {/* Audio Content - Hidden when loading */}
            <div className={`w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 gap-6 ${loading ? 'hidden' : ''}`}>
                {/* Audio Icon */}
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full p-8">
                    <Music className="h-16 w-16 text-purple-500 dark:text-purple-400" strokeWidth={1.5} />
                </div>
                
                {/* Audio Player - Always rendered so onCanPlay can fire */}
                <div className="w-full max-w-md">
                    <audio
                        controls
                        autoPlay
                        className="w-full h-12 rounded-lg"
                        controlsList="nodownload"
                        preload="metadata"
                        onCanPlay={() => {
                            setLoading(false);
                        }}
                        onError={() => {
                            setLocalError("Unable to load audio");
                            setLoading(false);
                        }}
                    >
                        <source src={url} type={contentType} />
                        Your browser does not support the audio element.
                    </audio>
                </div>
                
                {/* Content Type Info */}
                <div className="text-sm text-muted-foreground">
                    {contentType}
                </div>
            </div>
        </div>
    )
}

export default AudioModal;