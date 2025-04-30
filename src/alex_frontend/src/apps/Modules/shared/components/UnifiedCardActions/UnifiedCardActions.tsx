import React from "react";
import { Plus, Trash2, UserPlus, UserMinus, Loader2, Heart, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/lib/components/button";
import { ShelfSelectionDialog } from "@/apps/app/Perpetua/features/shelf-management/components/ShelfSelectionDialog";
import { useAddToShelf } from "@/apps/app/Perpetua/features/shelf-management/hooks/useAddToShelf";
import { Principal } from "@dfinity/principal";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { mint_nft, MintResult } from "@/features/nft/mint";
import { NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { useShelfOperations } from "@/apps/app/Perpetua/features/shelf-management/hooks/useShelfOperations";

interface UnifiedCardActionsProps {
  contentId: string; // Arweave ID, Shelf ID, NFT Nat ID string
  contentType: "Nft" | "Shelf" | "Markdown" | "Arweave"; // Added 'Arweave'
  ownerPrincipal?: Principal; // Owner for follow/permission checks - Kept for potential future use elsewhere, but not used by this button now
  isOwned: boolean; // Does the current user own this specific item?
  isSafeForMinting?: boolean; // Is this item safe to mint (relevant for Arweave type)
  // Context for other actions (kept for potential future use, but Remove is gone)
  currentShelfId?: string; // The shelf the item is currently displayed in (if any)
  parentShelfId?: string; // The shelf this item belongs to (for removal) - No longer used by this component
  itemId?: number; // ID of the item within its parent shelf (for removal) - No longer used by this component
  // UI state
  onToggleDetails?: () => void; // Now optional
  showDetails?: boolean;     // Now optional
  className?: string;
}

// Type for the context needed by the dialog and background processing
interface AddToShelfContext {
    originalContentId: string;
    originalContentType: UnifiedCardActionsProps['contentType'];
    initialIsOwned: boolean;
    isSafe?: boolean;
    currentShelfId?: string; // Pass currentShelfId for exclusion in dialog
}

export const UnifiedCardActions: React.FC<UnifiedCardActionsProps> = ({
  contentId,
  contentType,
  ownerPrincipal, // Kept prop, but logic using it is removed below
  isOwned,
  isSafeForMinting = true,
  currentShelfId,
  parentShelfId, // Kept prop, but logic using it is removed below
  itemId,       // Kept prop, but logic using it is removed below
  // onToggleDetails, // No longer needed internally
  // showDetails,     // No longer needed internally
  className
}) => {
  const [addToShelfContext, setAddToShelfContext] = React.useState<AddToShelfContext | null>(null);
  const [isProcessingAddToShelf, setIsProcessingAddToShelf] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);

  const { addContentToShelf, isLoggedIn } = useAddToShelf();
  const { createShelf } = useShelfOperations();
  // Removed user, currentUserPrincipal, removeItem, shelves, checkEditAccess, isFollowingUser, toggleFollowUser as they relate to removed actions
  // const { user } = useSelector((state: RootState) => state.auth);
  // const currentUserPrincipal = user?.principal;
  // const { removeItem, shelves } = useShelfOperations(); // Removed
  // const { checkEditAccess } = useContentPermissions(); // Removed
  // const { isFollowingUser, toggleFollowUser } = useFollowStatus(); // Removed

  // --- Determine Action Availability ---

  // Can Add to Shelf: Only requires user to be logged in
  const canAddToShelf = isLoggedIn;

  // Removed logic for canRemoveItem, canInteractWithFollow, currentlyFollowingOwner, showAnyAction, showSeparator1

  // If the Add to Shelf action isn't available, don't render anything
  if (!canAddToShelf) {
    return null;
  }

  const stopPropagation = (e: React.MouseEvent | React.TouchEvent | Event) => {
    e.stopPropagation();
    // Prevent default link navigation if the button is inside an anchor tag
    if (e.cancelable) {
      e.preventDefault();
    }
  };


  // --- Action Handlers ---

  // 1. Initial Click Handler: Perform checks and open dialog
  const handleAddToShelfClick = (e: React.MouseEvent) => {
    stopPropagation(e);

    if (!isLoggedIn) {
      toast.error("Please log in to add items to a shelf.");
      return;
    }

    // Check safety for Arweave content IF it's not owned
    if (contentType === 'Arweave' && !isOwned && !isSafeForMinting) {
        toast.error("Cannot add potentially unsafe content.");
        console.warn(`[UnifiedCardActions] Add to shelf blocked for unsafe Arweave content: ${contentId}`);
        return;
    }

    // Check if the createShelf function is available before opening
    if (!createShelf) {
        console.error("[UnifiedCardActions] Shelf creation function is unavailable. Cannot open dialog.");
        toast.error("Shelf management actions are currently unavailable.");
        return;
    }

    console.log(`[UnifiedCardActions] Initiating add to shelf for ${contentType} ID: ${contentId}, Owned: ${isOwned}, Safe: ${isSafeForMinting}`);
    setAddToShelfContext({
        originalContentId: contentId,
        originalContentType: contentType,
        initialIsOwned: isOwned,
        isSafe: isSafeForMinting,
        currentShelfId: currentShelfId
    });
  };

  // 2. Background Processor: Called after dialog confirms selection/creation
  const processAddToShelfInBackground = async (selectedShelfId: string) => {
    if (!addToShelfContext) {
        console.error("[UnifiedCardActions] Background process called without context.");
        toast.error("An unexpected error occurred (missing context).");
        return;
    }

    const { originalContentId, originalContentType, initialIsOwned } = addToShelfContext;
    let finalContentId = originalContentId;
    let finalContentType: "Nft" | "Shelf" | "Markdown" = 'Nft'; // Default, will be adjusted
    let needsMinting = false;

    setIsProcessingAddToShelf(true); // Indicate background processing starts

    try {
        // Determine if minting is needed
        if (!initialIsOwned && (originalContentType === 'Nft' || originalContentType === 'Arweave')) {
            // We already checked Arweave safety in handleAddToShelfClick
            needsMinting = true;
        } else if (originalContentType === 'Shelf') {
            finalContentType = 'Shelf';
        } else if (originalContentType === 'Markdown') {
            finalContentType = 'Markdown';
        } else {
            // Already owned Nft/SBT
            finalContentType = 'Nft';
        }

        // Perform minting if required
        if (needsMinting) {
            const mintResult = await mint_nft(originalContentId);

            if (mintResult.status === 'success' || mintResult.status === 'already_exists') {
                finalContentId = mintResult.id;
                finalContentType = 'Nft'; // Content is now an NFT/SBT
            } else {
                console.error(`[UnifiedCardActions] Background: Minting failed: ${mintResult.message}`);
                toast.error(mintResult.message || "Failed to acquire item for adding.");
                throw new Error("Minting failed"); // Stop processing
            }
        }

        // Determine collectionType for NFTs/SBTs - simplistic check based on ID length
        const collectionType = (finalContentType === 'Nft' && finalContentId.length >= 80) ? 'SBT' : (finalContentType === 'Nft' ? 'NFT' : undefined);

        // Now we get a proper Result object with status and message
        const addResult = await addContentToShelf(
            selectedShelfId,
            finalContentId,
            finalContentType,
            collectionType
        );

        // Handle the Result based on status
        if (addResult.status === 'success') {
            // Get the shelf name if possible - Requires access to shelves state again, re-add if needed or simplify toast
            // const selectedShelf = shelves.find(shelf => shelf.shelf_id === selectedShelfId);
            // const shelfName = selectedShelf ? selectedShelf.title : "shelf";
            // toast.success(`Item added to ${shelfName}`);
            toast.success(`Item added to shelf`); // Simplified toast
        } else {
            // Show the specific error from the backend
            toast.error(`Failed to add item: ${addResult.message}`);
        }

    } catch (error) {
        console.error("[UnifiedCardActions] Error during background add-to-shelf process:", error);
        // Avoid double-toasting if mint/add already toasted
        if (!(error instanceof Error && error.message === "Minting failed")) {
           toast.error(error instanceof Error ? error.message : "An unexpected error occurred while adding the item.");
        }
    } finally {
        setIsProcessingAddToShelf(false); // Indicate background processing finished
        setAddToShelfContext(null); // Clear context, dialog is already closed
    }
  };

  return (
    <>
      {/* True bookmark-shaped button with no box around it */}
      <div 
        className={`absolute right-3 top-0 z-40 cursor-pointer ${className ?? ""}`}
        onClick={handleAddToShelfClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        aria-label={isProcessingAddToShelf ? "Adding to shelf..." : "Add to shelf"}
      >
        <div className="relative">
          {/* Bookmark shadow */}
          <div className="absolute top-0.5 right-0 h-10 w-8 bg-black/30 rounded-b-md blur-[1px]"></div>
          
          {/* Bookmark shape - using same black as info button */}
          <div className="relative h-10 w-8 bg-black/75 transition-colors duration-150 rounded-b-md">
            {/* Notch at bottom of bookmark */}
            <div className="absolute bottom-0 left-1/2 h-2.5 w-3 transform -translate-x-1/2 bg-black/75 transition-colors duration-150" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}></div>
            
            {/* Content */}
            <div className="h-full w-full flex items-center justify-center pt-1">
              {isProcessingAddToShelf ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
              ) : (
                <Bookmark 
                  className={`h-5 w-5 transition-colors duration-150 ${isHovering ? 'text-brightyellow' : 'text-white dark:text-brightyellow'}`} 
                  fill={isHovering ? 'currentColor' : 'none'} 
                  strokeWidth={isHovering ? 2.5 : 2}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {addToShelfContext && (
        <ShelfSelectionDialog
          currentShelfId={addToShelfContext.currentShelfId}
          open={!!addToShelfContext}
          onConfirmSelection={processAddToShelfInBackground}
          onClose={() => {
            setAddToShelfContext(null);
          }}
          onCreateShelf={createShelf}
        />
      )}
    </>
  );
};

// Default export or named export depending on your project structure
// export default UnifiedCardActions; 