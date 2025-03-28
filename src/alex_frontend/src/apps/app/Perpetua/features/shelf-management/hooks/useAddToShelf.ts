import { useCallback } from "react";
import { useShelfOperations } from "./useShelfOperations";
import { useContentPermissions } from "@/apps/app/Perpetua/hooks/useContentPermissions";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { selectUserShelves, NormalizedShelf } from "@/apps/Modules/shared/state/perpetua/perpetuaSlice";
import { toast } from "sonner";
import { Principal } from "@dfinity/principal";
import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";

/**
 * Hook for adding content to shelves
 * 
 * This hook provides a simplified way to add different content types
 * to shelves and get a list of shelves that can be edited.
 */
export const useAddToShelf = () => {
  const { addItem } = useShelfOperations();
  const { checkEditAccess, currentUser } = useContentPermissions();
  const availableShelves = useAppSelector(selectUserShelves);

  /**
   * Convert a NormalizedShelf back to a Shelf for API calls
   */
  const denormalizeShelf = useCallback((normalizedShelf: NormalizedShelf): Shelf => {
    return {
      ...normalizedShelf,
      owner: Principal.fromText(normalizedShelf.owner)
    };
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
   * @returns Promise resolving to success boolean
   */
  const addContentToShelf = useCallback(async (
    shelfId: string, 
    content: string, 
    contentType: "Nft" | "Markdown" | "Shelf"
  ): Promise<boolean> => {
    try {
      // Find the target shelf
      const targetNormalizedShelf = availableShelves.find((s: NormalizedShelf) => s.shelf_id === shelfId);
      
      if (!targetNormalizedShelf) {
        toast.error("Shelf not found");
        return false;
      }
      
      // Check if user has edit access
      if (!checkEditAccess(shelfId)) {
        toast.error("You don't have permission to edit this shelf");
        return false;
      }
      
      // Prevent circular references for shelves
      if (contentType === "Shelf" && content === shelfId) {
        toast.error("Cannot add a shelf to itself");
        return false;
      }
      
      // Convert to Shelf type before passing to addItem
      const targetShelf = denormalizeShelf(targetNormalizedShelf);
      
      // Add the content to the shelf
      await addItem(targetShelf, content, contentType);
      
      toast.success(`Content added to ${targetShelf.title}`);
      return true;
    } catch (error) {
      console.error("Failed to add content to shelf:", error);
      toast.error("Failed to add content to shelf");
      return false;
    }
  }, [availableShelves, checkEditAccess, addItem, denormalizeShelf]);

  return {
    addContentToShelf,
    getEditableShelves,
    hasEditableShelvesExcluding: (excludeShelfId?: string) => getEditableShelves(excludeShelfId).length > 0,
    isLoggedIn: !!currentUser
  };
}; 