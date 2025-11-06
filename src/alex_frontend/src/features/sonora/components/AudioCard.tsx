import React from "react";
import { FileAudio, HardDrive, Calendar } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setSelected } from "../sonoraSlice";
import { Audio } from "../types";

interface AudioCardProps {
    item: Audio;
    actions?: React.ReactNode;
}

export const AudioCard: React.FC<AudioCardProps> = ({ item, actions }) => {
    const dispatch = useAppDispatch();
    const { selected } = useAppSelector((state) => state.sonora);
    
    const isSelected = selected?.id === item.id;

    const handleSelect = () => {
        if (selected?.id === item.id) return;
        dispatch(setSelected(item));
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFormatColor = (type: string) => {
        const colors: Record<string, string> = {
            'audio/mp3': 'bg-blue-100 text-blue-800',
            'audio/wav': 'bg-green-100 text-green-800',
            'audio/flac': 'bg-purple-100 text-purple-800',
            'audio/ogg': 'bg-orange-100 text-orange-800',
            'audio/m4a': 'bg-indigo-100 text-indigo-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getFormatLabel = (type: string) => {
        return type.replace('audio/', '').toUpperCase();
    };

    return (
        <div
            onClick={handleSelect}
            className={`group cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
                isSelected 
                    ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' 
                    : 'border-border bg-card hover:border-primary/30'
            }`}
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-full transition-all duration-200 ${
                    isSelected 
                        ? 'bg-primary/15 scale-110' 
                        : 'bg-muted group-hover:bg-primary/10'
                }`}>
                    <FileAudio size={24} className={`transition-colors ${
                        isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    }`} />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3">
                        <h3 className={`font-mono text-sm font-medium truncate transition-colors ${
                            isSelected ? 'text-primary' : 'text-foreground'
                        }`}>
                            {item.id}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFormatColor(item.type)}`}>
                            {getFormatLabel(item.type)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <HardDrive size={12} />
                            <span>{item.size}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{formatDate(item.timestamp)}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            </div>
        </div>
    );
};