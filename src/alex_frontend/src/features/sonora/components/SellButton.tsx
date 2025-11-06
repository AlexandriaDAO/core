import React from "react";
import { DollarSign } from "lucide-react";
import { Audio } from "../types";

interface SellButtonProps {
    item?: Audio;
}

export const SellButton: React.FC<SellButtonProps> = ({ item }) => {
    const handleSell = (e: React.MouseEvent) => {
        e.stopPropagation();
        alert("Sell functionality coming soon!");
    };

    return (
        <div 
            className="p-3 rounded-full transition-all duration-200 bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-primary/90 group-hover:text-white cursor-pointer"
            onClick={handleSell}
        >
            <DollarSign size={18} />
        </div>
    );
};