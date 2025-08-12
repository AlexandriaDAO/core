import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";
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
import { LoaderPinwheel, Pencil, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setEditing } from "../marketplaceSlice";
import { TransformedNft } from "../types";
import { useUpdate } from "../hooks";

interface UpdateProps {
	nft: TransformedNft;
}

const Update: React.FC<UpdateProps> = ({ nft }) => {
	const dispatch = useAppDispatch();
	const editing = useAppSelector((state) => state.marketplace.editing);
	const isOpen = !!(editing && editing === nft.arweave_id);

	const [price, setPrice] = useState(nft.price);
	const { isPending, error, mutate } = useUpdate();

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		if (price === nft.price) return;

		if (!price || isNaN(Number(price)) || Number(price) <= 0) {
			toast.error("Invalid price");
			return;
		}

		mutate({ nft, newPrice: price });
	};

	const handleOpen = () => {
		dispatch(setEditing(nft.arweave_id));
		setPrice(nft.price); // Reset price when opening
	};

	const handleClose = () => {
		dispatch(setEditing(""));
	};

	return (
		<>
			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<Button onClick={handleOpen} variant="outline" className="px-1 py-4 group/update">
						<Pencil className="group-hover/update:text-primary"/>
					</Button>
				</TooltipTrigger>
				<TooltipContent side="right" sideOffset={8} portal>
					<p>Update</p>
				</TooltipContent>
			</Tooltip>
			{isOpen && (
				<Dialog open={true}>
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
							<DialogTitle>Edit NFT Price</DialogTitle>
							<DialogDescription>
								Set a new price for your NFT.
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
									<Label htmlFor="price" className="text-right">
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
							<Button disabled={isPending} onClick={handleSubmit}>
								{isPending ? "Updating..." : "Update Price"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};

export default Update;
