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
import { LoaderPinwheel, Trash2, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setUnlisting } from "../studioSlice";
import { useUnlistAudio } from "../hooks/useUnlistAudio";
import { Audio } from "../types";

interface UnlistButtonProps {
    item: Audio;
    tokenId: string;
}

export const UnlistButton: React.FC<UnlistButtonProps> = ({ item, tokenId }) => {
    const dispatch = useAppDispatch();
    const unlisting = useAppSelector((state) => state.sonora.studio.unlisting);
    const isOpen = !!(unlisting && unlisting === item.id);

    const { unlistAudio, isLoading, error } = useUnlistAudio();

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setUnlisting(item.id));
    };

    const handleClose = () => {
        dispatch(setUnlisting(""));
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        unlistAudio({
            arweaveId: item.id,
            tokenId,
        });
    };

    return (
        <>
            <div 
                className="p-3 rounded-full transition-all duration-200 bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-destructive group-hover:text-destructive-foreground cursor-pointer"
                onClick={handleOpen}
            >
                <Trash2 size={18} />
            </div>
            {isOpen && (
                <Dialog open={true}>
                    <DialogContent className="sm:max-w-[425px]" closeIcon={null}>
                        <DialogHeader>
                            <DialogTitle>Remove from Marketplace</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to remove this audio NFT from the
                                marketplace?
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
                                    <p className="text-sm text-muted-foreground">
                                        This action will remove your audio NFT from the
                                        marketplace. You can list it again later if
                                        needed.
                                    </p>
                                    <div className="mt-3 space-y-1">
                                        <p className="text-sm">
                                            <strong>Type:</strong> {item.type}
                                        </p>
                                        <p className="text-sm">
                                            <strong>Size:</strong> {item.size}
                                        </p>
                                    </div>
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
                                variant="destructive"
                            >
                                {isLoading ? "Removing..." : "Remove from Sale"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};