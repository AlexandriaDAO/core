import React, { useRef, useState, useEffect } from "react";
import { FileAudio, HardDrive, Calendar, Play, Pause, Loader2, DollarSign, User } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setSelected, clearSelected } from "../sonoraSlice";
import { Audio } from "../types";

interface AudioCardProps {
    item: Audio;
    actions?: React.ReactNode;
    price?: string; // Optional price to display
    owner?: string; // Optional owner to display
}

export const AudioCard: React.FC<AudioCardProps> = ({ item, actions, price, owner }) => {
    const dispatch = useAppDispatch();
    const { selected } = useAppSelector((state) => state.sonora);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    
    const isSelected = selected?.id === item.id;
    const audioUrl = item.id.startsWith('blob:') || item.id.includes('.') ? 
        item.id : `https://arweave.net/${item.id}`;
    


    // Audio event handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleWaiting = () => setIsLoading(true);
        const handlePlay = () => {
            setIsPlaying(true);
            setIsLoading(false);
        };
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            setProgress(0);
        };
        const handleTimeUpdate = () => {
            if (audio.duration) {
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        const handleDurationChange = () => {
            setDuration(audio.duration);
        };
        const handleError = () => {
            setIsLoading(false);
            setIsPlaying(false);
        };

        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    // Reset state when not selected
    useEffect(() => {
        if (!isSelected && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            setIsPlaying(false);
            setIsLoading(false);
            setCurrentTime(0);
            setProgress(0);
        }
    }, [isSelected]);

    const handleCardClick = () => {
        dispatch(setSelected(item));
    };

    const handlePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        // Select this card when play is clicked
        if (!isSelected) {
            dispatch(setSelected(item));
        }

        // Stop all other audio
        document.querySelectorAll('audio').forEach(otherAudio => {
            if (otherAudio !== audio) {
                otherAudio.pause();
                otherAudio.src = '';
            }
        });

        if (isPlaying) {
            audio.pause();
        } else {
            // Load and play audio only when play is clicked
            if (!audio.src || audio.src !== audioUrl) {
                audio.src = audioUrl;
            }
            audio.play().catch(console.error);
        }
    };

    const formatDate = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getFormatColor = (type: string | null | undefined) => {
        if (!type) return 'bg-gray-100 text-gray-800';
        const colors: Record<string, string> = {
            'audio/mp3': 'bg-blue-100 text-blue-800',
            'audio/wav': 'bg-green-100 text-green-800',
            'audio/flac': 'bg-purple-100 text-purple-800',
            'audio/ogg': 'bg-orange-100 text-orange-800',
            'audio/m4a': 'bg-indigo-100 text-indigo-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getFormatLabel = (type: string | null | undefined) => {
        return type || 'No Type';
    };

    const formatOwner = (ownerPrincipal: string) => {
        if (!ownerPrincipal) return 'Unknown';
        // Show first 6 and last 4 characters with ellipsis
        if (ownerPrincipal.length > 12) {
            return `${ownerPrincipal.slice(0, 6)}...${ownerPrincipal.slice(-4)}`;
        }
        return ownerPrincipal;
    };

    return (
        <div
            onClick={handleCardClick}
            className={`group cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg hover:scale-[1.01] relative overflow-hidden font-roboto-condensed ${
                isSelected 
                    ? 'border-primary shadow-md scale-[1.01]' 
                    : 'border-border bg-card hover:border-primary/30'
            }`}
        >
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                preload="metadata"
                crossOrigin="anonymous"
                style={{ display: 'none' }}
            />

            {/* Progress Background */}
            {isSelected && progress > 0 && (
                <div 
                    className="absolute inset-0 bg-primary/10 transition-all duration-100 ease-linear"
                    style={{ 
                        background: `linear-gradient(to right, hsl(var(--primary) / 0.1) ${progress}%, transparent ${progress}%)` 
                    }}
                />
            )}

            {/* Loading Animation Background */}
            {isLoading && isSelected && (
                <div className="absolute inset-0 overflow-hidden">
                    <div 
                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                        style={{
                            animation: 'shimmer 2s infinite linear',
                            left: '-50%',
                        }}
                    />
                </div>
            )}

            <div className="relative p-4">
                <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                        onClick={handlePlayPause}
                        disabled={isLoading}
                        className={`p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            isSelected 
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : isPlaying ? (
                            <Pause size={24} />
                        ) : (
                            <Play size={24} />
                        )}
                    </button>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div>
                            <h3 className={`font-mono text-sm font-medium truncate transition-colors ${
                                isSelected ? 'text-primary' : 'text-foreground'
                            }`}>
                                {item.id}
                            </h3>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFormatColor(item.type)}`}>
                                {getFormatLabel(item.type)}
                            </span>
                            <div className="flex items-center gap-1">
                                <HardDrive size={12} />
                                <span>{item.size || 'Unknown size'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{formatDate(item.timestamp)}</span>
                            </div>
                            {price && (
                                <div className="flex items-center gap-1">
                                    <DollarSign size={12} />
                                    <span className="font-medium text-foreground">{price}</span>
                                </div>
                            )}
                            {owner && (
                                <div className="flex items-center gap-1">
                                    <User size={12} />
                                    <span className="font-medium text-foreground">{formatOwner(owner)}</span>
                                </div>
                            )}
                            {isSelected && duration > 0 && (
                                <div className="flex items-center gap-1">
                                    <span>
                                        {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                </div>
            </div>
        </div>
    );
};