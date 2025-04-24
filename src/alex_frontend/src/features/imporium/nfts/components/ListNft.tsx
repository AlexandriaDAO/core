import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import listNft from "../thunks/listNft";
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
import { LoaderPinwheel, X } from "lucide-react";

interface ListNftProps {
	id: string;
}

export function ListNft({ id }: ListNftProps) {
	const dispatch = useAppDispatch();
	const { actor: actorEmporium } = useEmporium();
	const { actor: actorIcrc7 } = useIcrc7();
	const [open, setOpen] = useState(false);
	const [price, setPrice] = useState("");

	const { listing, listingError } = useAppSelector(
		(state) => state.imporium.nfts
	);

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		// e.preventDefault();

        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
			toast.error("Invalid price");
			return;
		}

		if (!actorEmporium || !actorIcrc7) return;

        dispatch(listNft({
            id: id,
            price: price,
            actorEmporium: actorEmporium,
            actorIcrc7: actorIcrc7,
        }))
	};

	return (
		<Dialog open={open}>
			<DialogTrigger>
				<Button onClick={() => setOpen(true)} variant="primary" scale="sm">Sell NFT</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]" closeIcon={<Button
                    disabled={listing}
					onClick={() => setOpen(false)}
					variant="outline"
					scale="icon"
					rounded="full"
                    className="border-ring"
				><X size={18} /></Button>}
                >
				<DialogHeader>
					<DialogTitle>List NFT for Sale</DialogTitle>
					<DialogDescription>
						Set a price for your NFT. Once listed, others will be
						able to purchase it.
					</DialogDescription>
				</DialogHeader>
                {listingError && (
                    <Alert variant="danger" title="Error">{listingError}</Alert>
                )}
                {listing ? (
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
                    <Button disabled={listing} onClick={handleSubmit}>
                        {listing ? "Listing..." : "List for Sale"}
                    </Button>
                </DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ListNft;
