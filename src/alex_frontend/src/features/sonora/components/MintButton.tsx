import React from "react";
import { Coins, LoaderPinwheel } from "lucide-react";
import { Audio } from "../types";
import { useMinting } from "@/features/permasearch/hooks/useMinting";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";

interface MintButtonProps {
    item?: Audio;
}

export const MintButton: React.FC<MintButtonProps> = ({ item }) => {
    const { mintTransaction, isMinting } = useMinting();

    if (!item) return null;

    const handleMint = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await mintTransaction(item.id);
    };

    return (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <div 
                    className={`p-3 rounded-full transition-all duration-200 cursor-pointer ${
                        isMinting(item.id) 
                            ? 'bg-primary/20 opacity-100' 
                            : 'bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-primary group-hover:text-primary-foreground'
                    }`}
                    onClick={handleMint}
                >
                    {isMinting(item.id) ? (
                        <LoaderPinwheel size={18} className="animate-spin text-primary" />
                    ) : (
                        <Coins size={18} />
                    )}
                </div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8} portal>
                {isMinting(item.id) ? 'Minting...' : 'Mint NFT'}
            </TooltipContent>
        </Tooltip>
    );
};