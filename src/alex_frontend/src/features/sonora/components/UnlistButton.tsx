import React from "react";
import { X } from "lucide-react";
import { Audio } from "../types";

interface UnlistButtonProps {
    item?: Audio;
}

export const UnlistButton: React.FC<UnlistButtonProps> = ({ item }) => {
    const handleUnlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        alert("Unlist functionality coming soon!");
    };

    return (
        <div 
            className="p-3 rounded-full transition-all duration-200 bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-primary/90 group-hover:text-white cursor-pointer"
            onClick={handleUnlist}
        >
            <X size={18} />
        </div>
    );
};