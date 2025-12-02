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
import { useBuyBook } from "../hooks/useBuyBook";
import { Book } from "../types";

interface BuyButtonProps {
    item: Book;
    price: string;
    tokenId: string;
}

export const BuyButton: React.FC<BuyButtonProps> = ({ item, price, tokenId }) => {
    const dispatch = useAppDispatch();
    const purchasing = useAppSelector((state) => state.bibliotheca.market.purchasing);
    const isOpen = !!(purchasing && purchasing === item.id);

    const { buyBook, isLoading, error } = useBuyBook();

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setPurchasing(item.id));
    };

    const handleClose = () => {
        dispatch(setPurchasing(""));
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        buyBook({
            arweaveId: item.id,
            tokenId,
            price,
        });
    };

    return (
        <>
            <Button
                variant="outline"
                className="h-6 px-2 py-0 text-xs"
                onClick={handleOpen}
            >
                <ShoppingCart size={10} className="mr-1" />
                Buy
            </Button>
            {isOpen && (
                <Dialog open={true}>
                    <DialogContent className="sm:max-w-[425px]" closeIcon={null}>
                        <DialogHeader>
                            <DialogTitle>Purchase Book NFT</DialogTitle>
                            <DialogDescription>
                                Confirm your purchase of this book NFT
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
                                        This will transfer the book NFT to your wallet
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