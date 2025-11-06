import React from "react";
import { ShoppingCart } from "lucide-react";
import { Audio } from "../types";

interface BuyButtonProps {
    item?: Audio;
}

export const BuyButton: React.FC<BuyButtonProps> = ({ item }) => {
    const handleBuy = (e: React.MouseEvent) => {
        e.stopPropagation();
        alert("Buy functionality coming soon!");
    };

    return (
        <div 
            className="p-3 rounded-full transition-all duration-200 bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-primary/90 group-hover:text-white cursor-pointer"
            onClick={handleBuy}
        >
            <ShoppingCart size={18} />
        </div>
    );
};