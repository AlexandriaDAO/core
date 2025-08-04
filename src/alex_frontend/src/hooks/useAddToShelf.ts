import { useState } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useNftManager } from "@/hooks/actors";
import { usePerpetua } from "@/hooks/actors";
import mint from "@/features/nft/thunks/mint";
import { arweaveIdToNat } from "@/utils/id_convert";
import { AddToShelfItem } from "@/components/AddToShelfButton";

export const useAddToShelf = () => {
	const [isLoading, setIsLoading] = useState(false);
	const dispatch = useAppDispatch();
	const { actor: nftManagerActor } = useNftManager();
	const { actor: perpetuaActor } = usePerpetua();
	const { user } = useAppSelector((state) => state.auth);

	const addToShelf = async (item: AddToShelfItem, shelfIds: string[], onSuccess?: () => void) => {
		if (!user) {
			toast.error("Please log in to add items to shelves");
			return;
		}

		if (!nftManagerActor || !perpetuaActor) {
			toast.error("Actors not available");
			return;
		}

		if (shelfIds.length === 0) {
			toast.error("Please select at least one shelf");
			return;
		}

		setIsLoading(true);

		try {
			let tokenId = item.id;
			let needsMinting = false;

			// Check if we need to mint first
			if (!tokenId || (item.owner && item.owner !== user.principal)) {
				needsMinting = true;
			}

			// If we need to mint, do it first
			if (needsMinting) {
				try {
					await dispatch(mint({
						actor: nftManagerActor,
						transaction: item.arweaveId,
					})).unwrap();

					// Convert arweave ID to token ID for adding to shelf
					tokenId = arweaveIdToNat(item.arweaveId).toString();
				} catch (error) {
					// Check if the error is "You already own this NFT"
					const errorMessage = error instanceof Error ? error.message : String(error);
					if (errorMessage.includes("You already own this NFT")) {
						// User already owns the NFT, continue with adding to shelf
						tokenId = arweaveIdToNat(item.arweaveId).toString();
					} else {
						// Other errors should stop the process
						return;
					}
				}
			}

			// If we still don't have a token ID, generate it from arweave ID
			if (!tokenId) {
				tokenId = arweaveIdToNat(item.arweaveId).toString();
			}

			// Add to each selected shelf
			const addPromises = shelfIds.map(async (shelfId) => {
				try {
					const result = await perpetuaActor.add_item_to_shelf(shelfId, {
						content: { Nft: tokenId },
						reference_item_id: [],
						before: true,
					});

					if ("Ok" in result) {
						return { shelfId, success: true };
					} else {
						return { shelfId, success: false, error: result.Err };
					}
				} catch (error) {
					return {
						shelfId,
						success: false,
						error: error instanceof Error ? error.message : "Unknown error"
					};
				}
			});

			const results = await Promise.all(addPromises);

			// Show results
			const successful = results.filter(r => r.success);
			const failed = results.filter(r => !r.success);

			if (successful.length > 0) {
				toast.success(
					`Added to ${successful.length} shelf${successful.length > 1 ? "s" : ""}`
				);
				// Call success callback if provided
				onSuccess?.();
			}

			if (failed.length > 0) {
				failed.forEach(result => {
					toast.error(`Failed to add to shelf: ${result.error}`);
				});
			}

		} catch (error) {
			console.error("Error adding to shelf:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return {
		addToShelf,
		isLoading,
	};
};