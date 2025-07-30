import { useState } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useNftManager } from "@/hooks/actors";
import { usePerpetua } from "@/hooks/actors";
import mint from "@/features/nft/thunks/mint";
import type { AlexandrianToken } from "../types";

export const useAddToShelf = () => {
	const [isLoading, setIsLoading] = useState(false);
	const dispatch = useAppDispatch();
	const { actor: nftManagerActor } = useNftManager();
	const { actor: perpetuaActor } = usePerpetua();
	const { user } = useAppSelector((state) => state.auth);

	const addToShelf = async (token: AlexandrianToken, shelfIds: string[]) => {
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
			let tokenToAdd = token;

			// If token is not owned by current user, mint it first
			if (token.owner !== user.principal) {
				try {
					await dispatch(mint({
						actor: nftManagerActor,
						transaction: token.arweaveId,
					})).unwrap();

					// Update token ownership status
					tokenToAdd = { ...token, owner: user.principal };
				} catch (error) {
					// Error messages are already handled in the mint thunk
					return;
				}
			}

			// Add to each selected shelf
			const addPromises = shelfIds.map(async (shelfId) => {
				try {
					const result = await perpetuaActor.add_item_to_shelf(shelfId, {
						content: { Nft: tokenToAdd.id },
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
		isLoggedIn: !!user,
	};
};