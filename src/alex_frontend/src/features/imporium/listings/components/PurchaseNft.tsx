import React, { useEffect, useState } from "react";
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
import useEmporium from "@/hooks/actors/useEmporium";
import { useIcpLedger } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Alert } from "@/components/Alert";
// import { setListingError } from "../nftsSlice";
import { LoaderPinwheel, ShoppingCart, X } from "lucide-react";
import purchase from "../thunks/purchase";

interface PurchaseNftProps {
	id: string;
	price: string;
}

export function PurchaseNft({ id, price }: PurchaseNftProps) {
	const dispatch = useAppDispatch();
	const { actor: actorEmporium } = useEmporium();
	const { actor: actorIcpLedger } = useIcpLedger();
	const [open, setOpen] = useState(false);

	const { purchasing, purchasingError } = useAppSelector(
		(state) => state.imporium.listings
	);

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		if (!actorEmporium || !actorIcpLedger) return;

        dispatch(purchase({
            id: id,
            price: price,
            actorEmporium: actorEmporium,
            actorIcpLedger: actorIcpLedger,
        }))
	};

	return (
		<Dialog open={open}>
			<DialogTrigger>
				<Button onClick={() => setOpen(true)} variant="primary" scale="sm">Buy Now <ShoppingCart size={16} /></Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]" closeIcon={<Button
                    disabled={purchasing}
					onClick={() => setOpen(false)}
					variant="outline"
					scale="icon"
					rounded="full"
                    className="border-ring"
				><X size={18} /></Button>}
                >
				<DialogHeader>
					<DialogTitle>Purchase NFT</DialogTitle>
					<DialogDescription>
						Confirm this action
					</DialogDescription>
				</DialogHeader>
                {purchasingError && (
                    <Alert variant="danger" title="Error">{purchasingError}</Alert>
                )}
                {purchasing ? (
                    <div className="p-6 flex justify-center items-center h-full">
                        <LoaderPinwheel className="animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col">Are you sure you want to purchase this NFT?</div>
                    </div>
                )}
                <DialogFooter>
                    <Button disabled={purchasing} onClick={()=>setOpen(false)}>
                        Cancel
                    </Button>
                    <Button disabled={purchasing} onClick={handleSubmit}>
                        {purchasing ? "Purchasing..." : "Purchase"}
                    </Button>
                </DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default PurchaseNft;
