import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Button } from "@/lib/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import useEmporium from "@/hooks/actors/useEmporium";
import { useIcrc7 } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Alert } from "@/components/Alert";
import { toast } from "sonner";
// import { setListingError } from "../nftsSlice";
import { LoaderPinwheel, Pencil, X } from "lucide-react";
import edit from "../thunks/edit";

interface EditListedNftProps {
	id: string;
    originalPrice: string;
}

export function EditListedNft({ id, originalPrice }: EditListedNftProps) {
	const dispatch = useAppDispatch();
	const { actor } = useEmporium();
	const [open, setOpen] = useState(false);
	const [price, setPrice] = useState(originalPrice);

	const { editing, editingError } = useAppSelector(
		(state) => state.imporium.listings
	);

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		// e.preventDefault();

        if(price === originalPrice) return;

        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
			toast.error("Invalid price");
			return;
		}

		if (!actor) return;
        dispatch(edit({
            id: id,
            price: price,
            actor,
        }));
	};

	return (
		<Dialog open={open}>
			<DialogTrigger>
				<Button onClick={() => setOpen(true)} variant="primary" scale="sm">Edit Price <Pencil size={16} /></Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]" closeIcon={<Button
                    disabled={editing}
					onClick={() => setOpen(false)}
					variant="outline"
					scale="icon"
					rounded="full"
                    className="border-ring"
				><X size={18} /></Button>}
                >
				<DialogHeader>
					<DialogTitle>Edit NFT Price</DialogTitle>
					<DialogDescription>
						Set a new price for your NFT.
					</DialogDescription>
				</DialogHeader>
                {editingError && (
                    <Alert variant="danger" title="Error">{editingError}</Alert>
                )}
                {editing ? (
                    <div className="p-6 flex justify-center items-center h-full">
                        <LoaderPinwheel className="animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col">
                            <Label htmlFor="price" className="text-right">
                                Price
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
                    <Button disabled={editing} onClick={handleSubmit}>
                        {editing ? "Editing..." : "Edit"}
                    </Button>
                </DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default EditListedNft;
