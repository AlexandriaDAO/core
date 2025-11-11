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
import { LoaderPinwheel, X, Edit } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setEditing } from "../studioSlice";
import { useUpdateAudio } from "../hooks/useUpdateAudio";
import { Audio } from "../types";

interface EditButtonProps {
    item: Audio;
    currentPrice: string;
    tokenId: string;
}

export const EditButton: React.FC<EditButtonProps> = ({ item, currentPrice, tokenId }) => {
    const dispatch = useAppDispatch();
    const editing = useAppSelector((state) => state.studio.editing);
    const isOpen = !!(editing && editing === item.id);
    
    const [price, setPrice] = useState(currentPrice);
    const { updateAudio, isLoading, error } = useUpdateAudio();

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setEditing(item.id));
        setPrice(currentPrice);
    };

    const handleClose = () => {
        dispatch(setEditing(""));
        setPrice(currentPrice);
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (price === currentPrice) {
            toast.info("Price unchanged");
            return;
        }

        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            toast.error("Invalid price");
            return;
        }

        updateAudio({
            arweaveId: item.id,
            tokenId,
            newPrice: price,
        });
    };

    return (
        <>
            <div 
                className="p-3 rounded-full transition-all duration-200 bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-primary group-hover:text-primary-foreground cursor-pointer"
                onClick={handleOpen}
            >
                <Edit size={18} />
            </div>
            {isOpen && (
                <Dialog open={true}>
                    <DialogContent className="sm:max-w-[425px]" closeIcon={null}>
                        <DialogHeader>
                            <DialogTitle>Edit Audio NFT Price</DialogTitle>
                            <DialogDescription>
                                Set a new price for your audio NFT.
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
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Current price: {currentPrice} ICP
                                    </p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button disabled={isLoading} onClick={handleClose} variant="outline">
                                Cancel
                            </Button>
                            <Button disabled={isLoading} onClick={handleSubmit}>
                                {isLoading ? "Updating..." : "Update Price"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};