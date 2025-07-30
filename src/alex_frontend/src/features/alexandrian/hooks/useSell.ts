import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import useEmporium from "@/hooks/actors/useEmporium";
import { useIcrc7 } from "@/hooks/actors";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";

const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;

interface SellNftParams {
    tokenId: string;
    price: string;
}

export const useSell = () => {
    const queryClient = useQueryClient();
    const { actor: actorEmporium } = useEmporium();
    const { actor: actorIcrc7 } = useIcrc7();
    const { collectionType, selectedUser, page, pageSize, sortOrder, sortBy } = useAppSelector((state) => state.alexandrian);
    const { user } = useAppSelector((state) => state.auth);

    const queryKey = ["alexandrian-tokens", collectionType, selectedUser || "all", page, pageSize, sortOrder, sortBy, user?.principal];

    const sellMutation = useMutation({
        mutationFn: async ({ tokenId, price }: SellNftParams) => {
            if (!actorEmporium || !actorIcrc7) {
                throw new Error("Actors not available");
            }

            if (!price || isNaN(Number(price)) || Number(price) <= 0) {
                throw new Error("Invalid price");
            }

            const tokenIdNat = BigInt(tokenId);
            const priceFormat: bigint = BigInt(Math.round(Number(price) * 10 ** 8));

            // Check if token is already approved
            const isApproved = await actorIcrc7.icrc37_is_approved([
                {
                    token_id: tokenIdNat,
                    from_subaccount: [],
                    spender: {
                        owner: Principal.fromText(emporium_canister_id),
                        subaccount: [],
                    },
                },
            ]);

            // Approve if not already approved
            if (isApproved[0] === false) {
                const resultApproveIcrc7 = await actorIcrc7.icrc37_approve_tokens([
                    {
                        token_id: tokenIdNat,
                        approval_info: {
                            memo: [],
                            from_subaccount: [],
                            created_at_time: [],
                            expires_at: [],
                            spender: {
                                owner: Principal.fromText(emporium_canister_id),
                                subaccount: [],
                            },
                        },
                    },
                ]);
                if ("Err" in resultApproveIcrc7) {
                    throw new Error("Approval failed");
                }
            }

            // List the NFT
            const result = await actorEmporium.list_nft(tokenIdNat, priceFormat);

            if ("Err" in result) {
                throw new Error(result.Err);
            }

            return { tokenId, price };
        },
        onSuccess: ({ tokenId, price }) => {
            toast.success(`NFT listed for ${price} ICP`);

            // Invalidate and refetch the tokens query to update the UI
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error: Error) => {
            console.error("Error listing NFT:", error);
            toast.error(`Failed to list NFT: ${error.message}`);
        },
    });

    return {
        sellNft: sellMutation.mutate,
        isLoading: sellMutation.isPending,
        error: sellMutation.error?.message || null,
    };
};