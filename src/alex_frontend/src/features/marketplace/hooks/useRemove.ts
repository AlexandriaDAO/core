import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useEmporium } from "@/hooks/actors";
import { toast } from "sonner";
import { setUnlisting } from "../marketplaceSlice";
import { TransformedNft } from "../types";
import { ArweaveNft, ListingsResponse } from "../../../../../declarations/emporium/emporium.did";

export function useRemove() {
	const { actor } = useEmporium();
	const queryClient = useQueryClient();
	const dispatch = useAppDispatch();

	return useMutation({
		mutationFn: async (nft: TransformedNft) => {
			if (!actor) throw new Error("Actor not available");

			const result = await actor.remove_nft_listing(nft.token_id);

			// Handle Result type: { 'Ok' : string } | { 'Err' : string }
			if('Ok' in result) return { nft };

			const message = "Err" in result ? result.Err : 'An unknown error occurred while Unlisting the item'

			throw new Error(message);
		},
		onSuccess: ({ nft }) => {
			// Remove the NFT from all marketplace query caches
			queryClient.setQueriesData(
				{ queryKey: ["marketplace-listings"], exact: false },
				(oldData: ListingsResponse): ListingsResponse => {
					if (!oldData || !oldData.nfts) return oldData;

					// Filter out the removed NFT from the raw cached data: Vec<Nft>
					const updatedNfts = oldData.nfts.filter((cachedNft: ArweaveNft) => cachedNft.arweave_id !== nft.arweave_id);

					return {
						...oldData,
						nfts: updatedNfts,
						total_count: BigInt(Math.max(0, Number(oldData.total_count || 0) - 1)),
					};
				}
			);

			// Clear the unlisting state
			dispatch(setUnlisting(''));

			toast.success("NFT removed from marketplace");
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to remove NFT from marketplace");
		},
	});
}