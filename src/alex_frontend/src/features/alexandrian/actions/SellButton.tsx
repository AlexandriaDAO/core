import React, { useState } from "react";
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
import { Alert } from "@/components/Alert";
import { toast } from "sonner";
import { LoaderPinwheel, X } from "lucide-react";
import { useSell } from "../hooks/useSell";

interface SellButtonProps {
	tokenId: string;
}

export function SellButton({ tokenId }: SellButtonProps) {
	const [open, setOpen] = useState(false);
	const [price, setPrice] = useState("");
	const { sellNft, isLoading, error } = useSell();

	const handleSubmit = async () => {
		if (!price || isNaN(Number(price)) || Number(price) <= 0) {
			toast.error("Invalid price");
			return;
		}

		sellNft(
			{ tokenId, price },
			{
				onSuccess: () => {
					setOpen(false);
					setPrice("");
				},
			}
		);
	};

	return (
		<Dialog open={open}>
			<DialogTrigger asChild>
				<Button onClick={() => setOpen(true)} variant="outline" scale="sm">
					Sell NFT
				</Button>
			</DialogTrigger>
			<DialogContent
				className="sm:max-w-[425px]"
				closeIcon={isLoading ? null : <X size={20} onClick={() => setOpen(false)} />}
			>
				<DialogHeader>
					<DialogTitle>List NFT for Sale</DialogTitle>
					<DialogDescription>
						Set a price for your NFT. Once listed, others will be able to purchase it.
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
					<Button disabled={isLoading} onClick={handleSubmit}>
						{isLoading ? "Listing..." : "List for Sale"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default SellButton;