import React from "react";
import { Button } from "@/lib/components/button";
import { Coins, LoaderPinwheel, Check } from "lucide-react";
import { useAlexandrianMinting } from "../../hooks/useMinting";
import type { AlexandrianToken } from "../../types";

interface MintButtonProps {
	token: AlexandrianToken;
	updateTokenOwnership: (tokenId: string) => void;
}

export function MintButton({ token, updateTokenOwnership }: MintButtonProps) {
	const { mintToken, isMinting } = useAlexandrianMinting();

	const handleMint = async (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();

		await mintToken(token.id, token.arweaveId, () => {
			updateTokenOwnership(token.id);
		});
	};

	const isCurrentlyMinting = isMinting(token.id);
	const isOwned = token.owned;

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
					<span className="text-sm">Liked</span>
				</>
			) : (
				<>
					<Coins className="h-4 w-4" />
					<span className="text-sm">Like</span>
				</>
			)}
		</Button>
	);
}