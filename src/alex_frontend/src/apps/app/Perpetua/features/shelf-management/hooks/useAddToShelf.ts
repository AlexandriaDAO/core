import { useCallback } from "react";
import { useShelfOperations } from "./useShelfOperations";
import { useContentPermissions } from "@/apps/app/Perpetua/hooks/useContentPermissions";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { selectUserShelves, selectLoading, NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { Principal } from "@dfinity/principal";
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";
import { useIdentity } from "@/lib/ic-use-identity";
import { AddItemResult } from "@/apps/app/Perpetua/state/thunks/itemThunks";
import { usePerpetua } from "@/hooks/actors";

/**
 * Hook for adding content to shelves
 * 
 * This hook provides a simplified way to add different content types
 * to shelves and get a list of shelves that can be edited.
 */
export const useAddToShelf = () => {
  const {actor} = usePerpetua();
  const { addItem } = useShelfOperations();
  const { checkEditAccess, currentUser } = useContentPermissions();
  const availableShelves = useAppSelector(selectUserShelves);
  const shelvesLoading = useAppSelector(selectLoading);
  const dispatch = useAppDispatch();
  const { identity } = useIdentity();

  /**
   * Convert a NormalizedShelf back to a Shelf for API calls
   */
  const denormalizeShelf = useCallback((normalizedShelf: NormalizedShelf): ShelfPublic => {
    return {
      ...normalizedShelf,
      owner: Principal.fromText(normalizedShelf.owner),
      created_at: BigInt(normalizedShelf.created_at),
      updated_at: BigInt(normalizedShelf.updated_at)
    } as ShelfPublic;
  }, []);

  /**
   * Get shelves that the current user has edit access to
   * Filters out the provided shelfId to prevent circular references
   * 
   * @param excludeShelfId - Optional shelf ID to exclude from results
   * @returns Array of shelves the user can edit
   */
  const getEditableShelves = useCallback((excludeShelfId?: string) => {
    // Filter shelves by edit access and exclude the current shelf
    return availableShelves.filter((shelf: NormalizedShelf) => {
      // Don't include the shelf itself (prevents circular references)
      if (excludeShelfId && shelf.shelf_id === excludeShelfId) {
        return false;
      }
      
      // Check if user has edit access to this shelf
      return checkEditAccess(shelf.shelf_id);
    });
  }, [availableShelves, checkEditAccess]);

  /**
   * Add content to a shelf
   * 
   * @param shelfId - ID of the shelf to add content to
   * @param content - Content identifier (NFT id, markdown content, or shelf id)
   * @param contentType - Type of content being added
   * @param collectionType - For NFTs, specify if it's NFT or SBT
   * @returns Promise resolving to the complete Result object
   */
  const addContentToShelf = useCallback(async (
    shelfId: string, 
    content: string, 
    contentType: "Nft" | "Markdown" | "Shelf",
    collectionType?: "NFT" | "SBT"
  ): Promise<AddItemResult> => {
    try {
      let targetShelf: ShelfPublic | undefined = undefined;
      let canEdit = false;

      const targetNormalizedShelf = availableShelves.find((s: NormalizedShelf) => s.shelf_id === shelfId);
      
      if (targetNormalizedShelf) {
        targetShelf = denormalizeShelf(targetNormalizedShelf);
        canEdit = checkEditAccess(shelfId); 
      } else {
        console.warn(`[useAddToShelf] Shelf ID ${shelfId} not in availableShelves. Assuming public shelf and proceeding. Backend will verify permissions.`);
        let ownerPrincipal: Principal;
        const potentialPrincipal = currentUser as any; // Use 'any' for the duck-typing check

        if (potentialPrincipal && typeof potentialPrincipal.toText === 'function') {
          ownerPrincipal = potentialPrincipal as Principal; // Cast to Principal after the check
        } else if (typeof currentUser === 'string') {
          try {
            ownerPrincipal = Principal.fromText(currentUser);
          } catch (e) {
            console.error("[useAddToShelf] Failed to parse current user string as Principal:", currentUser, e);
            ownerPrincipal = Principal.anonymous(); // Fallback
          }
        } else {
          ownerPrincipal = Principal.anonymous(); // Fallback for null/undefined or unexpected type
        }

        targetShelf = {
          shelf_id: shelfId,
          owner: ownerPrincipal, 
          title: `Shelf ${shelfId.substring(0,5)}...`, 
          description: [],
          items: [], 
          item_positions: [],
          created_at: BigInt(0), 
          updated_at: BigInt(0), 
          appears_in: [],
          tags: [],
          public_editing: true, 
        };
        canEdit = true; 
      }
      
      if (!targetShelf) { 
        return { status: 'error', message: "Shelf not found (unexpected)" };
      }
      
      if (!canEdit) {
        return { status: 'error', message: "You don't have permission to edit this shelf" };
      }
      
      if (contentType === "Shelf" && content === shelfId) {
        return { status: 'error', message: "Cannot add a shelf to itself" };
      }
      
      return await addItem(
        targetShelf, 
        content, 
        contentType,
        contentType === "Nft" ? collectionType : undefined
      );
      
    } catch (error) {
      console.error("Failed to add content to shelf:", error);
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 
                 "An unexpected error occurred while adding to shelf" 
      };
    }
  }, [availableShelves, checkEditAccess, addItem, denormalizeShelf, currentUser]);

  /**
   * Fetch public shelves by a specific tag from the backend actor.
   */
  const fetchPublicShelvesByTag = useCallback(async (tag: string): Promise<ShelfPublic[]> => {
    try {
      if(!actor) throw new Error('Perpetua actor unavailable');
      if (!actor) {
        console.error("Perpetua actor could not be initialized");
        return [];
      }
      const result = await actor.get_public_shelves_by_tag(tag);
      if ('Ok' in result) {
        return result.Ok as ShelfPublic[];
      } else if ('Err' in result) {
        console.error("Error fetching public shelves by tag:", result.Err);
        return [];
      } else {
        console.error("Unexpected result structure when fetching public shelves by tag:", result);
        return [];
      }
    } catch (error) {
      console.error("Exception when fetching public shelves by tag:", error);
      return [];
    }
  }, [actor]);

  return {
    addContentToShelf,
    getEditableShelves,
    hasEditableShelvesExcluding: (excludeShelfId?: string) => getEditableShelves(excludeShelfId).length > 0,
    isLoggedIn: !!currentUser,
    shelvesLoading,
    fetchPublicShelvesByTag,
  };
};