import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEmporium } from "@/hooks/actors";
import useIcpLedger from "@/hooks/actors/useIcpLedger";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";
import { setPurchasing } from "../marketplaceSlice";
import { TransformedNft } from "../types";
import { ArweaveNft, ListingsResponse } from "../../../../../declarations/emporium/emporium.did";

export function usePurchase() {
	const { actor: actorEmporium } = useEmporium();
	const { actor: actorIcpLedger } = useIcpLedger();
	const user = useAppSelector((state) => state.auth.user);
	const queryClient = useQueryClient();
	const dispatch = useAppDispatch();

	const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;

	return useMutation({
		mutationFn: async (nft: TransformedNft) => {
			if (!user) throw new Error("User not found");
			if (!actorEmporium) throw new Error("Emporium actor not available");
			if (!actorIcpLedger) throw new Error("ICP Ledger actor not available");

			// Calculate approval amount (price + fee)
			let amountFormatApprove: bigint = BigInt(
				Number((Number(nft.price) + 0.0001) * 10 ** 8).toFixed(0)
			);

			// Check current allowance
			const checkApproval = await actorIcpLedger.icrc2_allowance({
				account: {
					owner: Principal.fromText(user.principal),
					subaccount: [],
				},
				spender: {
					owner: Principal.fromText(emporium_canister_id),
					subaccount: [],
				},
			});

			// Approve if allowance is insufficient
			if (checkApproval.allowance < amountFormatApprove) {
				const resultIcpApprove = await actorIcpLedger.icrc2_approve({
					spender: {
						owner: Principal.fromText(emporium_canister_id),
						subaccount: [],
					},
					amount: amountFormatApprove,
					fee: [BigInt(10000)],
					memo: [],
					from_subaccount: [],
					created_at_time: [],
					expected_allowance: [],
					expires_at: [],
				});

				if ("Err" in resultIcpApprove) {
					const error = resultIcpApprove.Err;
					let errorMessage = "Unknown error";
					if ("TemporarilyUnavailable" in error) {
						errorMessage = "Service is temporarily unavailable";
					}
					throw new Error(errorMessage);
				}
			}

			// Purchase the NFT
			const result = await actorEmporium.buy_nft(nft.token_id);

			if ('Ok' in result) return { nft };

			if ("Err" in result) throw new Error(result.Err);

			throw new Error('An unknown error occurred while acquiring the item');
		},
		onSuccess: ({ nft }) => {
			// Remove the purchased NFT from all marketplace query caches
			queryClient.setQueriesData(
				{ queryKey: ["marketplace-listings"], exact: false },
				(oldData: ListingsResponse): ListingsResponse => {
					if (!oldData || !oldData.nfts) return oldData;

					// Filter out the purchased NFT from the raw cached data: Vec<Nft>
					const updatedNfts = oldData.nfts.filter((cachedNft: ArweaveNft) => cachedNft.arweave_id !== nft.arweave_id);

					return {
						...oldData,
						nfts: updatedNfts,
						total_count: BigInt(Math.max(0, Number(oldData.total_count || 0) - 1)),
					};
				}
			);

			// Clear the purchasing state
			dispatch(setPurchasing(''));

			toast.success("NFT purchased successfully!");
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to purchase NFT");
		},
	});
}