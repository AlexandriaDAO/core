import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import useEmporium from "@/hooks/actors/useEmporium";
import { toast } from "sonner";
import { setUnlisting, fetchShelfBookNFTs } from "../shelfSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";

interface UnlistBookParams {
    arweaveId: string;
    tokenId: string;
}

export const useUnlistBook = () => {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();
    const { actor: actorEmporium } = useEmporium();
    const { user } = useAppSelector((state) => state.auth);

    const unlistMutation = useMutation({
        mutationFn: async ({ tokenId }: UnlistBookParams) => {
            if (!actorEmporium) {
                throw new Error("Emporium actor not available");
            }

            const tokenIdNat = BigInt(tokenId);

            // Remove the NFT from marketplace
            const result = await actorEmporium.remove_nft_listing(tokenIdNat);

            if ("Err" in result) {
                throw new Error(result.Err);
            }

            return { tokenId };
        },
        onSuccess: ({ tokenId }) => {
            toast.success("Book NFT removed from marketplace");
            
            // Close the dialog
            dispatch(setUnlisting(""));

            // Refresh studio data to update UI
            if (user?.principal) {
                dispatch(fetchShelfBookNFTs({ userPrincipal: user.principal }));
            }
            queryClient.invalidateQueries({ queryKey: ["studio-book-nfts"] });
        },
        onError: (error: Error) => {
            console.error("Error unlisting book NFT:", error);
            toast.error(`Failed to unlist: ${error.message}`);
        },
    });

    return {
        unlistBook: unlistMutation.mutate,
        isLoading: unlistMutation.isPending,
        error: unlistMutation.error?.message || null,
    };
};