import { useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useNftManager } from "@/hooks/actors";
import mint from "@/features/nft/thunks/mint";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks/useAppSelector";

export function useMinting() {
	const queryClient = useQueryClient();
	const dispatch = useAppDispatch();

	const { actor } = useNftManager();

	const { collectionType, selectedUser, page, pageSize, sortOrder, sortBy } = useAppSelector((state) => state.alexandrian);
	const { user } = useAppSelector((state) => state.auth);

	const [mintingTokenId, setMintingTokenId] = useState<string | null>(null);

	const queryKey = [ "alexandrian-tokens", collectionType, selectedUser || "all", page, pageSize, sortOrder, sortBy ];

	// Optimistic update mutation for token ownership
	const updateOwnership = (tokenId: string) => {
		// Update the cache for this specific query
		queryClient.setQueryData(queryKey, (oldData: any) => {
			if (!oldData || !user) return oldData;

			return {
				...oldData,
				tokens: {
					...oldData.tokens,
					[tokenId]: {
						...oldData.tokens[tokenId],
						owner: user.principal,
					},
				},
			};
		});
	}

	const mintToken = useCallback(async (tokenId: string, arweaveId: string ) => {
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

			updateOwnership(tokenId);
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