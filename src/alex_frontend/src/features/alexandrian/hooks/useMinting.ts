import { useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useNftManager } from "@/hooks/actors";
import mint from "@/features/nft/thunks/mint";
import { toast } from "sonner";

export function useAlexandrianMinting() {
	const dispatch = useAppDispatch();
	const { actor } = useNftManager();
	const [mintingTokenId, setMintingTokenId] = useState<string | null>(null);

	const mintToken = useCallback(async (
		tokenId: string,
		arweaveId: string,
		onSuccess?: () => void
	) => {
		if (!actor) {
			toast.error("NFT Manager not available");
			return;
		}

		if (mintingTokenId) {
			toast.info("Already minting another NFT");
			return;
		}

		setMintingTokenId(tokenId);

		try {
			await dispatch(mint({ actor, transaction: arweaveId })).unwrap();
			onSuccess?.();
		} catch (error) {
			// Error is handled by the mint thunk
		} finally {
			setMintingTokenId(null);
		}
	}, [actor, mintingTokenId]);

	const isMinting = useCallback((tokenId: string) => mintingTokenId === tokenId, [mintingTokenId]);

	return {
		mintingTokenId,
		mintToken,
		isMinting,
	};
}