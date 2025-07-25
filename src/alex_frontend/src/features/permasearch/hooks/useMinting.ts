import { useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useNftManager } from "@/hooks/actors";
import mint from "@/features/nft/thunks/mint";
import { toast } from "sonner";

export function useMinting() {
	const dispatch = useAppDispatch();
	const { actor } = useNftManager();
	const [mintingTx, setMintingTx] = useState<string | null>(null);

	const mintTransaction = useCallback(async ( transactionId: string, onSuccess?: () => void ) => {
		if (!actor) {
			toast.error("Please authenticate to mint NFTs");
			return;
		}

		if (mintingTx) {
			toast.info("Already minting another NFT");
			return;
		}

		setMintingTx(transactionId);

		try {
			await dispatch(mint({ actor, transaction: transactionId })).unwrap();
			onSuccess?.();
		} catch (error) {
			toast.error("Failed to mint NFT");
		} finally {
			setMintingTx(null);
		}
	}, [actor, mintingTx]);

	const isMinting = useCallback((transactionId: string) => mintingTx === transactionId, [mintingTx]);

	return {
		mintingTx,
		mintTransaction,
		isMinting,
	};
}