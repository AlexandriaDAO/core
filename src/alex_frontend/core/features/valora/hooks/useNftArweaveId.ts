import { useQuery } from "@tanstack/react-query";
import { nft_manager } from "../../../../../declarations/nft_manager";
import { natToArweaveId } from "@/utils/id_convert";
import { valoraKeys } from "../types";

export function useNftArweaveId(tokenId: string | undefined) {
	return useQuery({
		queryKey: valoraKeys.nftArweaveId(tokenId ?? ""),
		queryFn: async () => {
			let id = BigInt(tokenId!);

			// SBTs have IDs >= 90 chars long; convert to original NFT ID first
			if (tokenId!.length >= 90) {
				id = await nft_manager.scion_to_og_id(id);
			}

			return natToArweaveId(id);
		},
		enabled: !!tokenId,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
	});
}
