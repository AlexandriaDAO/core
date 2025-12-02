import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import useEmporium from "@/hooks/actors/useEmporium";
import { toast } from "sonner";
import { setEditing, fetchShelfBookNFTs } from "../shelfSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";

interface UpdateBookParams {
    arweaveId: string;
    tokenId: string;
    newPrice: string;
}

export const useUpdateBook = () => {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();
    const { actor: actorEmporium } = useEmporium();
    const { user } = useAppSelector((state) => state.auth);

    const updateMutation = useMutation({
        mutationFn: async ({ tokenId, newPrice }: UpdateBookParams) => {
            if (!actorEmporium) {
                throw new Error("Emporium actor not available");
            }

            if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
                throw new Error("Invalid price");
            }

            const tokenIdNat = BigInt(tokenId);
            const priceFormat: bigint = BigInt(Math.round(Number(newPrice) * 10 ** 8));

            // Update the NFT price
            const result = await actorEmporium.update_nft_price(tokenIdNat, priceFormat);

            if ("Err" in result) {
                throw new Error(result.Err);
            }

            return { tokenId, newPrice };
        },
        onSuccess: ({ tokenId, newPrice }) => {
            toast.success(`Book NFT price updated to ${newPrice} ICP`);
            
            // Close the dialog
            dispatch(setEditing(""));

            // Refresh studio data to update UI
            if (user?.principal) {
                dispatch(fetchShelfBookNFTs({ userPrincipal: user.principal }));
            }
            queryClient.invalidateQueries({ queryKey: ["studio-book-nfts"] });
        },
        onError: (error: Error) => {
            console.error("Error updating book NFT price:", error);
            toast.error(`Failed to update price: ${error.message}`);
        },
    });

    return {
        updateBook: updateMutation.mutate,
        isLoading: updateMutation.isPending,
        error: updateMutation.error?.message || null,
    };
};