import React from "react";
import { Coins, LoaderPinwheel } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Book } from "../types";
import { useMinting } from "@/features/permasearch/hooks/useMinting";

interface MintButtonProps {
    item?: Book;
}

export const MintButton: React.FC<MintButtonProps> = ({ item }) => {
    const { mintTransaction, isMinting } = useMinting();

    if (!item) return null;

    const handleMint = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await mintTransaction(item.id);
    };

    return (
        <Button
            variant="outline"
            className="h-6 px-2 py-0 text-xs"
            onClick={handleMint}
            disabled={isMinting(item.id)}
        >
            {isMinting(item.id) ? (
                <>
                    <LoaderPinwheel size={10} className="animate-spin mr-1" />
                    Minting
                </>
            ) : (
                <>
                    <Coins size={10} className="mr-1" />
                    Mint
                </>
            )}
        </Button>
    );
};