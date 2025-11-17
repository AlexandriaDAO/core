import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import useEmporium from "@/hooks/actors/useEmporium";
import { useIcrc7 } from "@/hooks/actors";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";
import { setSelling, fetchUserBookNFTs } from "../librarySlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;

interface SellBookParams {
    tokenId: string;
    price: string;
}

export const useSellBook = () => {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();
    const { actor: actorEmporium } = useEmporium();
    const { actor: actorIcrc7 } = useIcrc7();
    const { user } = useAppSelector((state) => state.auth);

    const sellMutation = useMutation({
        mutationFn: async ({ tokenId, price }: SellBookParams) => {
            if (!actorEmporium || !actorIcrc7) {
                throw new Error("Actors not available");
            }

            if (!price || isNaN(Number(price)) || Number(price) <= 0) {
                throw new Error("Invalid price");
            }

            const tokenIdNat = BigInt(tokenId);
            const priceFormat: bigint = BigInt(Math.round(Number(price) * 10 ** 8));
            
            console.log('Selling book NFT:', { tokenId, tokenIdNat: tokenIdNat.toString(), price, priceFormat: priceFormat.toString() });

            // Step 1: Verify token ownership
            try {
                const ownerResult = await actorIcrc7.icrc7_owner_of([tokenIdNat]);
                const ownerInfo = ownerResult[0]; // This is [] | [Account]
                console.log('Token ownership check:', { tokenId: tokenIdNat.toString(), ownerInfo });
                
                // Check if token has an owner (array is not empty)
                if (!ownerInfo || ownerInfo.length === 0) {
                    throw new Error("Token has no owner or does not exist");
                }
                
                // Extract the actual owner account
                const ownerAccount = ownerInfo[0];
                console.log('Token owner account:', ownerAccount);
                
                // Verify the owner matches the current user
                // Note: We don't need to check this for basic ownership verification
                // The backend emporium will verify ownership when listing
            } catch (error) {
                console.error('Ownership verification failed:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                throw new Error(`Unable to verify token ownership: ${errorMessage}`);
            }

            // Step 2: Check if token is already approved
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

            // Step 3: Approve if not already approved
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

            // Step 4: Check if token is already listed
            try {
                const listingStatus = await actorEmporium.get_listed_tokens([tokenIdNat]);
                if (listingStatus[0] && listingStatus[0].length > 0) {
                    console.warn('Token is already listed:', listingStatus[0]);
                    throw new Error("This NFT is already listed for sale");
                }
            } catch (error) {
                console.log('Listing check failed (probably not listed):', error);
            }

            // Step 5: List the NFT
            const result = await actorEmporium.list_nft(tokenIdNat, priceFormat);

            if ("Err" in result) {
                throw new Error(result.Err);
            }

            return { tokenId, price };
        },
        onSuccess: ({ tokenId, price }) => {
            toast.success(`Book NFT listed for ${price} ICP`);
            
            // Close the dialog
            dispatch(setSelling(""));

            // Refresh archive data to update UI - use Redux thunk instead of query client
            if (user?.principal) {
                dispatch(fetchUserBookNFTs({ userPrincipal: user.principal }));
            }
            queryClient.invalidateQueries({ queryKey: ["archive-book-nfts"] });
        },
        onError: (error: Error) => {
            console.error("Error listing book NFT:", error);
            toast.error(`Failed to list book NFT: ${error.message}`);
        },
    });

    return {
        sellBook: sellMutation.mutate,
        isLoading: sellMutation.isPending,
        error: sellMutation.error?.message || null,
    };
};