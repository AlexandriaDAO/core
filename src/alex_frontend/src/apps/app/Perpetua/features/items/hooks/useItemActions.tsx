import { useCallback } from "react";
import { useShelfOperations } from "@/apps/app/Perpetua/features/shelf-management/hooks";
import { useContentPermissions } from "@/apps/app/Perpetua/hooks/useContentPermissions";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { selectShelves } from "@/apps/Modules/shared/state/perpetua/perpetuaSlice";
import { toast } from "sonner";

/**
 * Hook for item management actions in Perpetua
 * 
 * This hook provides functions for managing items across shelves,
 * including the ability to add content to shelves.
 */
export const useItemActions = () => {
  const { addItem, shelves, loading } = useShelfOperations();
  const { checkEditAccess, currentUser } = useContentPermissions();
  const availableShelves = useAppSelector(selectShelves);

  /**
   * Get shelves that the current user has edit access to
   * Filters out the provided shelfId to prevent circular references
   * 
   * @param excludeShelfId - Optional shelf ID to exclude from results
   * @returns Array of shelves the user can edit
   */
  const getEditableShelves = useCallback((excludeShelfId?: string) => {
    return availableShelves.filter(shelf => {
      // Don't include the shelf itself to prevent circular references
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
      const targetShelf = shelves.find(s => s.shelf_id === shelfId);
      
      if (!targetShelf) {
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
      
      // Add the content to the shelf
      await addItem(targetShelf, content, contentType);
      
      toast.success(`Content added to ${targetShelf.title}`);
      return true;
    } catch (error) {
      console.error("Failed to add content to shelf:", error);
      toast.error("Failed to add content to shelf");
      return false;
    }
  }, [shelves, checkEditAccess, addItem]);

  return {
    addContentToShelf,
    getEditableShelves,
    loading
  };
}; 