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
import { useIcrc7 } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Alert } from "@/components/Alert";
// import { setListingError } from "../nftsSlice";
import { LoaderPinwheel, Trash2, X } from "lucide-react";
import unlist from "../thunks/unlist";

interface UnListNftProps {
	id: string;
}

export function UnListNft({ id }: UnListNftProps) {
	const dispatch = useAppDispatch();
	const { actor } = useEmporium();
	const [open, setOpen] = useState(false);

	const { unlisting, unlistingError } = useAppSelector(
		(state) => state.imporium.listings
	);

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		if (!actor) return;

        dispatch(unlist({
            id: id,
            actor,
        }))
	};

	return (
		<Dialog open={open}>
			<DialogTrigger>
				<Button onClick={() => setOpen(true)} variant="primary" scale="sm">Remove <Trash2 size={16} /></Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]" closeIcon={<Button
                    disabled={unlisting}
					onClick={() => setOpen(false)}
					variant="outline"
					scale="icon"
					rounded="full"
                    className="border-ring"
				><X size={18} /></Button>}
                >
				<DialogHeader>
					<DialogTitle>Unlist NFT</DialogTitle>
					<DialogDescription>
						Confirm this action
					</DialogDescription>
				</DialogHeader>
                {unlistingError && (
                    <Alert variant="danger" title="Error">{unlistingError}</Alert>
                )}
                {unlisting ? (
                    <div className="p-6 flex justify-center items-center h-full">
                        <LoaderPinwheel className="animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col">Are you sure you want to remove this NFT from sale?</div>
                    </div>
                )}
                <DialogFooter>
                    <Button disabled={unlisting} onClick={()=>setOpen(false)}>
                        Cancel
                    </Button>
                    <Button disabled={unlisting} onClick={handleSubmit}>
                        {unlisting ? "Removing..." : "Remove"}
                    </Button>
                </DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default UnListNft;
