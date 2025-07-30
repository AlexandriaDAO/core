import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEmporium } from "@/hooks/actors";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setEditing } from "../marketplaceSlice";
import { TransformedNft } from "../types";
import { ArweaveNft, ListingsResponse } from "../../../../../declarations/emporium/emporium.did";

interface UpdateParams {
	nft: TransformedNft;
	newPrice: string;
}

export function useUpdate() {
	const { actor } = useEmporium();
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ nft, newPrice }: UpdateParams) => {
			if (!actor) throw new Error("Actor not available");

			const priceFormat: bigint = BigInt(Math.round(Number(newPrice) * 10 ** 8));

			const result = await actor.update_nft_price(nft.token_id, priceFormat);

			if ('Ok' in result) return { nft, newPrice };

			if ("Err" in result) throw new Error(result.Err);

			throw new Error('An unknown error occurred while editing the item');
		},
		onSuccess: ({ nft, newPrice }) => {
			// Update all marketplace query caches that contain this NFT
			queryClient.setQueriesData(
				{ queryKey: ["marketplace-listings"], exact: false },
				(oldData: ListingsResponse): ListingsResponse => {
					if (!oldData || !oldData.nfts) return oldData;

					// Find and update the specific NFT in the raw cached data: Vec<Nft>
					const nftIndex = oldData.nfts.findIndex((cachedNft: ArweaveNft) => cachedNft.arweave_id === nft.arweave_id);

					if (nftIndex === -1) return oldData;

					const updatedNfts = [...oldData.nfts];
					updatedNfts[nftIndex] = {
						...updatedNfts[nftIndex],
						price: BigInt(Math.round(Number(newPrice) * 10 ** 8)),
					};

					return {
						...oldData,
						nfts: updatedNfts,
					};
				}
			);

			// Clear the editing state
			dispatch(setEditing(''));

			toast.success("NFT price updated successfully");
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to update NFT price");
		},
	});
}
