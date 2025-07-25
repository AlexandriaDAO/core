import React from "react";
import { Music, Play } from "lucide-react";

// NEW: Import our shared types
interface AudioCardProps {
	url: string;
	contentType: string;
}

const AudioCard: React.FC<AudioCardProps> = ({ url, contentType }) => {
    return (
        <div className="relative w-full h-full py-10 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-md overflow-hidden group cursor-pointer">
            {/* Audio Preview Background */}
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Music className="h-12 w-12 text-purple-400 dark:text-purple-500" strokeWidth={1.5} />
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Audio</div>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-white/90 rounded-full p-3 shadow-lg">
                    <Play className="h-6 w-6 text-black fill-black ml-0.5" />
                </div>
            </div>
        </div>
    )
}

export default AudioCard;