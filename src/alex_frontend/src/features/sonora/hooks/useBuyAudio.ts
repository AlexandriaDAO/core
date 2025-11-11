import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import useEmporium from "@/hooks/actors/useEmporium";
import useIcpLedger from "@/hooks/actors/useIcpLedger";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";
import { setPurchasing, fetchMarketAudioNFTs } from "../marketSlice";

interface BuyAudioParams {
    arweaveId: string;
    tokenId: string;
    price: string;
}

export const useBuyAudio = () => {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const { actor: actorEmporium } = useEmporium();
    const { actor: actorIcpLedger } = useIcpLedger();

    const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;

    const buyMutation = useMutation({
        mutationFn: async ({ arweaveId, tokenId, price }: BuyAudioParams) => {
            if (!user) {
                throw new Error("User not found");
            }
            if (!actorEmporium) {
                throw new Error("Emporium actor not available");
            }
            if (!actorIcpLedger) {
                throw new Error("ICP Ledger actor not available");
            }

            const tokenIdNat = BigInt(tokenId);

            // Calculate approval amount (price + fee)
            const priceNum = parseFloat(price);
            const amountFormatApprove = BigInt(
                Number((priceNum + 0.0001) * 10 ** 8).toFixed(0)
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
                    throw new Error(`Approval failed: ${errorMessage}`);
                }
            }
            
            // Buy the NFT from the marketplace
            const result = await actorEmporium.buy_nft(tokenIdNat);

            if ("Err" in result) {
                throw new Error(result.Err);
            }

            return { arweaveId, price };
        },
        onSuccess: ({ arweaveId, price }) => {
            toast.success(`Audio NFT purchased for ${price} ICP`);
            
            // Close the dialog
            dispatch(setPurchasing(""));

            // Refresh market data to update UI
            dispatch(fetchMarketAudioNFTs({ page: 1, pageSize: 8, appendMode: false, currentUserPrincipal: user?.principal }));
        },
        onError: (error: Error) => {
            console.error("Error purchasing audio NFT:", error);
            toast.error(`Failed to purchase audio NFT: ${error.message}`);
        },
    });

    return {
        buyAudio: buyMutation.mutate,
        isLoading: buyMutation.isPending,
        error: buyMutation.error?.message || null,
    };
};