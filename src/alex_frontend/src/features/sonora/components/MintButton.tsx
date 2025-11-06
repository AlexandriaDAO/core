import React from "react";
import { Coins } from "lucide-react";
import { Audio } from "../types";

interface MintButtonProps {
    item?: Audio;
}

export const MintButton: React.FC<MintButtonProps> = ({ item }) => {
    const handleMint = (e: React.MouseEvent) => {
        e.stopPropagation();
        alert("Mint functionality coming soon!");
    };

    return (
        <div 
            className="p-3 rounded-full transition-all duration-200 bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-primary/90 group-hover:text-white cursor-pointer"
            onClick={handleMint}
        >
            <Coins size={18} />
        </div>
    );
};