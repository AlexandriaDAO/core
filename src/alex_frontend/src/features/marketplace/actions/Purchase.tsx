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
import { setPurchasing } from "../marketplaceSlice";
import { TransformedNft } from "../types";
import { usePurchase } from "../hooks";

interface PurchaseProps {
	nft: TransformedNft;
}

const Purchase: React.FC<PurchaseProps> = ({ nft }) => {
	const dispatch = useAppDispatch();
	const purchasing = useAppSelector((state) => state.marketplace.purchasing);
	const isOpen = !!(purchasing && purchasing === nft.arweave_id);

	const { isPending, error, mutate } = usePurchase();

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		mutate(nft);
	};

	const handleOpen = () => {
		dispatch(setPurchasing(nft.arweave_id));
	};

	const handleClose = () => {
		dispatch(setPurchasing(""));
	};

	return (
		<>
			<Button onClick={handleOpen} variant="primary" scale="sm">
				Buy Now <ShoppingCart size={16} />
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
						<DialogTitle>Purchase NFT</DialogTitle>
						<DialogDescription>
							Confirm your purchase of this NFT
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
							<div className="flex flex-col space-y-2">
								<p className="text-sm">
									<strong>Price:</strong> {nft.price} ICP
								</p>
								<p className="text-sm text-muted-foreground">
									This will transfer the NFT to your wallet
									and remove it from the marketplace.
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
							variant="primary"
						>
							{isPending
								? "Processing..."
								: `Buy for ${nft.price} ICP`}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default Purchase;
