import React from "react";
import { Button } from "@/lib/components/button";
import { Coins, LoaderPinwheel, Check } from "lucide-react";
import { useMinting } from "../hooks/useMinting";
import { Transaction } from "../types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";

const MintButton: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
	const { mintTransaction, isMinting } = useMinting();

	if (!transaction) return null;

	const handleMint = async (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();

		await mintTransaction(transaction.id);
	};

	if(transaction.minted) return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>
				<Button
					variant="outline"
					scale="sm"
					className="px-1 py-4 opacity-60 cursor-auto hover:text-foreground"
				>
					<Check />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="right" sideOffset={8} portal>Minted</TooltipContent>
		</Tooltip>
	)

	return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>
				<Button
					variant="outline"
					scale="sm"
					onClick={handleMint}
					disabled={isMinting(transaction.id)}
					className="px-1 py-4 group/mint"
				>
					{isMinting(transaction.id) ? <LoaderPinwheel className="animate-spin" /> : <Coins className="group-hover/mint:text-primary" />}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="right" sideOffset={8} portal>Mint</TooltipContent>
		</Tooltip>
	)
}


export default MintButton;