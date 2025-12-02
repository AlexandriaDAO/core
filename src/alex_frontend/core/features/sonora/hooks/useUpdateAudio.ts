import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import useEmporium from "@/hooks/actors/useEmporium";
import { toast } from "sonner";
import { setEditing, fetchStudioAudioNFTs } from "../studioSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";

interface UpdateAudioParams {
    arweaveId: string;
    tokenId: string;
    newPrice: string;
}

export const useUpdateAudio = () => {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();
    const { actor: actorEmporium } = useEmporium();
    const { user } = useAppSelector((state) => state.auth);

    const updateMutation = useMutation({
        mutationFn: async ({ tokenId, newPrice }: UpdateAudioParams) => {
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
            toast.success(`Audio NFT price updated to ${newPrice} ICP`);
            
            // Close the dialog
            dispatch(setEditing(""));

            // Refresh studio data to update UI
            if (user?.principal) {
                dispatch(fetchStudioAudioNFTs({ userPrincipal: user.principal }));
            }
            queryClient.invalidateQueries({ queryKey: ["studio-audio-nfts"] });
        },
        onError: (error: Error) => {
            console.error("Error updating audio NFT price:", error);
            toast.error(`Failed to update price: ${error.message}`);
        },
    });

    return {
        updateAudio: updateMutation.mutate,
        isLoading: updateMutation.isPending,
        error: updateMutation.error?.message || null,
    };
};