import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Alert } from "@/components/Alert";
import { toast } from "sonner";
import { LoaderPinwheel, X, DollarSign } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSelling } from "../archiveSlice";
import { useSellAudio } from "../hooks/useSellAudio";
import { Audio } from "../types";

interface SellButtonProps {
    item: Audio;
    tokenId: string;
}

export const SellButton: React.FC<SellButtonProps> = ({ item, tokenId }) => {
    const dispatch = useAppDispatch();
    const selling = useAppSelector((state) => state.archive.selling);
    const isOpen = !!(selling && selling === item.id);
    
    const [price, setPrice] = useState("");
    const { sellAudio, isLoading, error } = useSellAudio();

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setSelling(item.id));
    };

    const handleClose = () => {
        dispatch(setSelling(""));
        setPrice("");
    };

    const handleSubmit = async () => {
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            toast.error("Invalid price");
            return;
        }

        sellAudio({ tokenId, price });
    };

    return (
        <>
            <div 
                className="p-3 rounded-full transition-all duration-200 bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-primary group-hover:text-primary-foreground cursor-pointer"
                onClick={handleOpen}
            >
                <DollarSign size={18} />
            </div>
            {isOpen && (
                <Dialog open={true}>
                    <DialogContent className="sm:max-w-[425px]" closeIcon={null}>
                        <DialogHeader>
                            <DialogTitle>List Audio NFT for Sale</DialogTitle>
                            <DialogDescription>
                                Set a price for your audio NFT. Once listed, others will be able to purchase it on the marketplace.
                            </DialogDescription>
                        </DialogHeader>
                        {error && <Alert variant="danger" title="Error">{error}</Alert>}
                        {isLoading ? (
                            <div className="p-6 flex justify-center items-center h-full">
                                <LoaderPinwheel className="animate-spin" />
                            </div>
                        ) : (
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-col">
                                    <Label htmlFor="price" className="text-right mb-2">
                                        Price (ICP)
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button disabled={isLoading} onClick={handleClose} variant="outline">
                                Cancel
                            </Button>
                            <Button disabled={isLoading} onClick={handleSubmit}>
                                {isLoading ? "Listing..." : "List for Sale"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};