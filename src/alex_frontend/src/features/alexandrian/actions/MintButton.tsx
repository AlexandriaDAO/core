import React from "react";
import { Button } from "@/lib/components/button";
import { ThumbsUp, LoaderPinwheel, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";
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
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>
				<Button
					variant="outline"
					scale="sm"
					onClick={handleMint}
					disabled={isCurrentlyMinting || isOwned}
					className="px-1 py-4 group/like"
				>
					{isCurrentlyMinting ? (
						<LoaderPinwheel className="animate-spin" />
					) : isOwned ? (
						<Check />
					) : (
						<ThumbsUp className="group-hover/like:text-primary" />
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="right" sideOffset={8} portal>
				{isCurrentlyMinting ? 'Liking...' : isOwned ? 'Liked' : 'Like'}
			</TooltipContent>
		</Tooltip>
	);
}