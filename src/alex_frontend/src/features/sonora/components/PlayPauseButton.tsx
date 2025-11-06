import React from "react";
import { Play, Pause } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { playAudio, pauseAudio } from "../sonoraSlice";
import { Audio } from "../types";

interface PlayPauseButtonProps {
    item: Audio;
}

export const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({ item }) => {
    const dispatch = useAppDispatch();
    const { selected, playing } = useAppSelector((state) => state.sonora);
    
    const isSelected = selected?.id === item.id;
    const isPlaying = playing && isSelected;

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(playAudio(item));
    };

    const handlePause = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(pauseAudio());
    };

    return (
        <div className={`p-3 rounded-full transition-all duration-200 cursor-pointer ${
            isSelected
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-primary/90 group-hover:text-white'
        }`}>
            {isPlaying ? (
                <Pause 
                    size={18} 
                    fill="currentColor"
                    onClick={handlePause}
                />
            ) : (
                <Play 
                    size={18} 
                    fill="currentColor"
                    onClick={handlePlay}
                />
            )}
        </div>
    );
};