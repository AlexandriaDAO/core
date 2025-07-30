import React from "react";
import { Button } from "@/lib/components/button";
import { Coins, LoaderPinwheel, Check } from "lucide-react";
import { useMinting } from "../hooks/useMinting";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import type { AlexandrianToken } from "../types";

interface MintButtonProps {
	token: AlexandrianToken;
}

export function MintButton({ token }: MintButtonProps) {
	const { mintToken, isMinting } = useMinting();
	const { user } = useAppSelector((state) => state.auth);

	const handleMint = async (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();

		await mintToken(token.id, token.arweaveId);
	};

	const isCurrentlyMinting = isMinting(token.id);
	const isOwned = user?.principal === token.owner;

	return (
		<Button
			variant="outline"
			scale="sm"
			onClick={handleMint}
			disabled={isCurrentlyMinting || isOwned}
			className="flex items-center gap-2"
		>
			{isCurrentlyMinting ? (
				<>
					<LoaderPinwheel className="h-4 w-4 animate-spin" />
					<span className="text-sm">Minting...</span>
				</>
			) : isOwned ? (
				<>
					<Check className="h-4 w-4" />
					<span className="text-sm">Minted</span>
				</>
			) : (
				<>
					<Coins className="h-4 w-4" />
					<span className="text-sm">Mint</span>
				</>
			)}
		</Button>
	);
}