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
import { setUnlisting } from "../marketplaceSlice";
import { TransformedNft } from "../types";
import { useRemove } from "../hooks";

interface RemoveProps {
	nft: TransformedNft;
}

const Remove: React.FC<RemoveProps> = ({ nft }) => {
	const dispatch = useAppDispatch();
	const unlisting = useAppSelector((state) => state.marketplace.unlisting);
	const isOpen = !!(unlisting && unlisting === nft.arweave_id);

	const { isPending, error, mutate } = useRemove();

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		mutate(nft);
	};

	const handleOpen = () => {
		dispatch(setUnlisting(nft.arweave_id));
	};

	const handleClose = () => {
		dispatch(setUnlisting(""));
	};

	return (
		<>
			<Button onClick={handleOpen} variant="primary" scale="sm">
				Remove <Trash2 size={16} />
			</Button>
			<Dialog open={isOpen}>
				<DialogContent
					className="sm:max-w-[425px]"
					closeIcon={
						<Button
							disabled={isPending}
							onClick={handleClose}
							variant="outline"
							scale="icon"
							rounded="full"
							className="border-ring"
						>
							<X size={18} />
						</Button>
					}
				>
					<DialogHeader>
						<DialogTitle>Unlist NFT</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove this NFT from the
							marketplace?
						</DialogDescription>
					</DialogHeader>
					{error && (
						<Alert variant="danger" title="Error">
							{error.message}
						</Alert>
					)}
					{isPending ? (
						<div className="p-6 flex justify-center items-center h-full">
							<LoaderPinwheel className="animate-spin" />
						</div>
					) : (
						<div className="grid gap-4 py-4">
							<div className="flex flex-col">
								<p className="text-sm text-muted-foreground">
									This action will remove your NFT from the
									marketplace. You can list it again later if
									needed.
								</p>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button disabled={isPending} onClick={handleClose}>
							Cancel
						</Button>
						<Button
							disabled={isPending}
							onClick={handleSubmit}
							variant="destructive"
						>
							{isPending ? "Removing..." : "Remove from Sale"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default Remove;
