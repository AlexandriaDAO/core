import React from "react";
import { Button } from "@/lib/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/lib/components/dialog";
import { Alert } from "@/components/Alert";
import { LoaderPinwheel, ShoppingCart, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setPurchasing } from "../marketSlice";
import { useBuyAudio } from "../hooks/useBuyAudio";
import { Audio } from "../types";

interface BuyButtonProps {
    item: Audio;
    price: string;
    tokenId: string;
}

export const BuyButton: React.FC<BuyButtonProps> = ({ item, price, tokenId }) => {
    const dispatch = useAppDispatch();
    const purchasing = useAppSelector((state) => state.sonora.market.purchasing);
    const isOpen = !!(purchasing && purchasing === item.id);

    const { buyAudio, isLoading, error } = useBuyAudio();

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setPurchasing(item.id));
    };

    const handleClose = () => {
        dispatch(setPurchasing(""));
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        buyAudio({
            arweaveId: item.id,
            tokenId,
            price,
        });
    };

    return (
        <>
            <div 
                className="p-3 rounded-full transition-all duration-200 bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-primary group-hover:text-primary-foreground cursor-pointer"
                onClick={handleOpen}
            >
                <ShoppingCart size={18} />
            </div>
            {isOpen && (
                <Dialog open={true}>
                    <DialogContent className="sm:max-w-[425px]" closeIcon={null}>
                        <DialogHeader>
                            <DialogTitle>Purchase Audio NFT</DialogTitle>
                            <DialogDescription>
                                Confirm your purchase of this audio NFT
                            </DialogDescription>
                        </DialogHeader>
                        {error && (
                            <Alert variant="danger" title="Error">
                                {error}
                            </Alert>
                        )}
                        {isLoading ? (
                            <div className="p-6 flex justify-center items-center h-full">
                                <LoaderPinwheel className="animate-spin" />
                            </div>
                        ) : (
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-col space-y-2">
                                    <p className="text-sm">
                                        <strong>Price:</strong> {price} ICP
                                    </p>
                                    <p className="text-sm">
                                        <strong>Type:</strong> {item.type}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Size:</strong> {item.size}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        This will transfer the audio NFT to your wallet
                                        and remove it from the marketplace.
                                    </p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button disabled={isLoading} onClick={handleClose} variant="outline">
                                Cancel
                            </Button>
                            <Button
                                disabled={isLoading}
                                onClick={handleSubmit}
                                variant="primary"
                            >
                                {isLoading
                                    ? "Processing..."
                                    : `Buy for ${price} ICP`}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};