import React from "react";
import { MoreHorizontal, Plus, Trash2, UserPlus, UserMinus, Loader2, Heart, Bookmark, Info, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/lib/components/dropdown-menu";
import { Button } from "@/lib/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/lib/components/alert-dialog";
import { ShelfSelectionDialog } from "@/apps/app/Perpetua/features/shelf-management/components/ShelfSelectionDialog";
import { useAddToShelf } from "@/apps/app/Perpetua/features/shelf-management/hooks/useAddToShelf";
import { useShelfOperations } from "@/apps/app/Perpetua/features/shelf-management/hooks/useShelfOperations";
import { useContentPermissions } from "@/apps/app/Perpetua/hooks/useContentPermissions";
import { useFollowStatus } from "@/apps/app/Perpetua/features/following/hooks/useFollowStatus";
import { Principal } from "@dfinity/principal";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { mint_nft, MintResult } from "@/features/nft/mint";
import { NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice"; // Import if needed for shelf name toast

interface UnifiedCardActionsProps {
  contentId: string; // Arweave ID, Shelf ID, NFT Nat ID string
  contentType: "Nft" | "Shelf" | "Markdown" | "Arweave"; // Added 'Arweave'
  ownerPrincipal?: Principal; // Owner for follow/permission checks
  isOwned: boolean; // Does the current user own this specific item?
  isSafeForMinting?: boolean; // Is this item safe to mint (relevant for Arweave type)
  // Context for other actions
  currentShelfId?: string; // The shelf the item is currently displayed in (if any)
  parentShelfId?: string; // The shelf this item belongs to (for removal)
  itemId?: number; // ID of the item within its parent shelf (for removal)
  // UI state
  onToggleDetails: () => void; // Callback to toggle details visibility
  showDetails: boolean; // Are details currently visible?
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
  ownerPrincipal,
  isOwned,
  isSafeForMinting = true, // Default to true (safe), receives false if unsafe Arweave
  currentShelfId,
  parentShelfId,
  itemId,
  onToggleDetails,
  showDetails,
  className
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  // State to control the ShelfSelectionDialog and hold context
  const [addToShelfContext, setAddToShelfContext] = React.useState<AddToShelfContext | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  // Keep track of background processing state for the specific action
  const [isProcessingAddToShelf, setIsProcessingAddToShelf] = React.useState(false);

  const { addContentToShelf, isLoggedIn } = useAddToShelf(); // Removed getShelfById as it wasn't available
  const { user } = useSelector((state: RootState) => state.auth);
  const currentUserPrincipal = user?.principal;
  const { removeItem, shelves } = useShelfOperations();
  const { checkEditAccess } = useContentPermissions();
  const { isFollowingUser, toggleFollowUser } = useFollowStatus();

  // --- Determine Action Availability ---

  // Can Add to Shelf: Only requires user to be logged in to see the option
  const canAddToShelf = isLoggedIn;

  // Can Remove Item: Standard logic
  const canRemoveItem = !!parentShelfId && itemId !== undefined && checkEditAccess(parentShelfId);

  // Can Follow Owner: Logged in, owner exists, and not the owner themselves
  const ownerPrincipalString = ownerPrincipal instanceof Principal ? ownerPrincipal.toText() : undefined;
  const isOwnerOfContent = !!currentUserPrincipal && !!ownerPrincipalString && currentUserPrincipal === ownerPrincipalString;
  const canInteractWithFollow = isLoggedIn && !!ownerPrincipalString && !isOwnerOfContent;

  // Determine if currently following (only if interaction is possible)
  const currentlyFollowingOwner = canInteractWithFollow && ownerPrincipal instanceof Principal
    ? isFollowingUser(ownerPrincipal)
    : false;

  // --- Determine Overall Menu Visibility ---
  const showAnyAction = canAddToShelf || canRemoveItem || canInteractWithFollow || true; // Keep menu if toggle details is always an option
  const showSeparator1 = (canAddToShelf || canRemoveItem) && canInteractWithFollow; // Separator needed if primary actions and follow action exist

  // If no actions are available, don't render anything
  if (!showAnyAction) {
    return null;
  }

  const stopPropagation = (e: React.MouseEvent | React.TouchEvent | Event) => {
    e.stopPropagation();
    if (!(e instanceof Event)) {
      e.preventDefault();
    }
  };

  // --- Action Handlers ---

  // 1. Initial Click Handler: Perform checks and open dialog
  const handleAddToShelfClick = (e: React.MouseEvent) => {
    stopPropagation(e);
    setMenuOpen(false);

    if (!isLoggedIn) {
      toast.error("Please log in to add items to a shelf.");
      return;
    }

    // Check safety for Arweave content IF it's not owned (owned content is assumed safe/already an NFT)
    if (contentType === 'Arweave' && !isOwned && !isSafeForMinting) {
        toast.error("Cannot add potentially unsafe content.");
        console.warn(`[UnifiedCardActions] Add to shelf blocked for unsafe Arweave content: ${contentId}`);
        return;
    }

    console.log(`[UnifiedCardActions] Initiating add to shelf for ${contentType} ID: ${contentId}, Owned: ${isOwned}, Safe: ${isSafeForMinting}`);
    // Set context to open the dialog
    setAddToShelfContext({
        originalContentId: contentId,
        originalContentType: contentType,
        initialIsOwned: isOwned,
        isSafe: isSafeForMinting,
        currentShelfId: currentShelfId // Pass current shelf ID for exclusion
    });
  };

  // 2. Background Processor: Called after dialog confirms selection
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
            console.log(`[UnifiedCardActions] Background: Minting required for unowned ${originalContentType}: ${originalContentId}`);
        } else if (originalContentType === 'Shelf') {
            finalContentType = 'Shelf';
            console.log(`[UnifiedCardActions] Background: Adding existing Shelf: ${originalContentId}`);
        } else if (originalContentType === 'Markdown') {
            finalContentType = 'Markdown';
            console.log(`[UnifiedCardActions] Background: Adding existing Markdown: ${originalContentId}`);
        } else {
            // Already owned Nft/SBT
            finalContentType = 'Nft';
            console.log(`[UnifiedCardActions] Background: Adding existing owned NFT/SBT: ${originalContentId}`);
        }

        // Perform minting if required
        if (needsMinting) {
            console.log(`[UnifiedCardActions] Background: Starting minting for ${originalContentId}`);
            const mintResult = await mint_nft(originalContentId);
            
            if (mintResult.status === 'success' || mintResult.status === 'already_exists') {
                console.log(`[UnifiedCardActions] Background: Mint ${mintResult.status}. ID: ${mintResult.id}`);
                finalContentId = mintResult.id;
                finalContentType = 'Nft'; // Content is now an NFT/SBT
            } else {
                console.error(`[UnifiedCardActions] Background: Minting failed: ${mintResult.message}`);
                toast.error(mintResult.message || "Failed to acquire item for adding.");
                throw new Error("Minting failed"); // Stop processing
            }
        }

        // Add to shelf (using finalContentId and finalContentType)
        console.log(`[UnifiedCardActions] Background: Adding ${finalContentType} (${finalContentId}) to shelf ${selectedShelfId}`);
        
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
            // Get the shelf name if possible
            const selectedShelf = shelves.find(shelf => shelf.shelf_id === selectedShelfId);
            const shelfName = selectedShelf ? selectedShelf.title : "shelf";
            
            toast.success(`Item added to ${shelfName}`);
            console.log(`[UnifiedCardActions] Background: Successfully added item to shelf ${selectedShelfId}`);
        } else {
            // Show the specific error from the backend
            toast.error(`Failed to add item: ${addResult.message}`);
            console.error(`[UnifiedCardActions] Background: Failed to add item: ${addResult.message}`);
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


  const handleRemoveClick = (e: React.MouseEvent) => {
    stopPropagation(e);
    setRemoveDialogOpen(true);
    setMenuOpen(false);
  };

  const handleRemoveConfirm = async (e: React.MouseEvent) => {
    stopPropagation(e);
    if (!parentShelfId || itemId === undefined) return;

    try {
      await removeItem(parentShelfId, itemId);
      toast.success("Item removed from shelf");
      setRemoveDialogOpen(false);
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Error removing item from shelf");
    } finally {
       setRemoveDialogOpen(false);
    }
  };

  const handleToggleFollowOwner = async (e: React.MouseEvent) => {
    stopPropagation(e);
    if (!canInteractWithFollow || !(ownerPrincipal instanceof Principal)) return;

    setFollowLoading(true);
    setMenuOpen(false);
    try {
      await toggleFollowUser(ownerPrincipal);
      // Toast handled in hook
    } catch (error) {
      console.error("Error toggling follow state:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    stopPropagation(e);
    onToggleDetails();
    setMenuOpen(false);
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`h-8 w-8 p-0 absolute top-2 right-2 z-20 bg-background/80 backdrop-blur-sm hover:bg-muted ${className ?? ""}`}
            onClick={stopPropagation} // Stop propagation here too
            aria-label="Open actions menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" onClick={stopPropagation} className="w-52">
          {/* Add to Shelf */}
          {canAddToShelf && (
            <DropdownMenuItem
              onClick={handleAddToShelfClick}
              disabled={isProcessingAddToShelf} // Disable while background task runs
              className="cursor-pointer"
            >
              {isProcessingAddToShelf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bookmark className="h-4 w-4 mr-2" />
              )}
              {isProcessingAddToShelf ? 'Adding...' : 'Add to shelf'}
            </DropdownMenuItem>
          )}

          {/* Remove from Shelf */}
          {canRemoveItem && (
            <DropdownMenuItem
              onClick={handleRemoveClick}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove from shelf
            </DropdownMenuItem>
          )}

          {showSeparator1 && <DropdownMenuSeparator />}

          {/* Follow/Unfollow Owner */}
          {canInteractWithFollow && (
            <DropdownMenuItem
              onClick={handleToggleFollowOwner}
              disabled={followLoading}
              className="cursor-pointer"
            >
              {followLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : currentlyFollowingOwner ? (
                <UserMinus className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {followLoading ? 'Processing...' : currentlyFollowingOwner ? 'Unfollow Owner' : 'Follow Owner'}
            </DropdownMenuItem>
          )}

          {/* Show/Hide Details */}
          <DropdownMenuItem
            onClick={handleDetailsClick}
            className="cursor-pointer"
          >
            {showDetails ? <ChevronUp className="h-4 w-4 mr-2" /> : <Info className="h-4 w-4 mr-2" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add to Shelf Dialog - Opens when addToShelfContext is set */}
      {addToShelfContext && (
        <ShelfSelectionDialog
          // Pass the context needed for display and background processing
          originalContentId={addToShelfContext.originalContentId}
          originalContentType={addToShelfContext.originalContentType}
          initialIsOwned={addToShelfContext.initialIsOwned}
          // Pass currentShelfId directly for exclusion logic within the dialog
          currentShelfId={addToShelfContext.currentShelfId}
          // Control visibility
          open={!!addToShelfContext}
          // Function to call when a shelf is selected and confirmed
          onConfirmSelection={processAddToShelfInBackground}
          // Function to call when dialog is closed (X button, overlay click)
          onClose={() => {
            setAddToShelfContext(null); // Clear context to close
            // Optionally reset processing state if closed prematurely, though it might finish anyway
            // setIsProcessingAddToShelf(false);
          }}
        />
      )}

      {/* Remove Item Confirmation Dialog */}
      {removeDialogOpen && canRemoveItem && (
        <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <AlertDialogContent onClick={stopPropagation}>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove item from shelf</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this item from its current shelf?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => { stopPropagation(e); setRemoveDialogOpen(false); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveConfirm}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

// Default export or named export depending on your project structure
// export default UnifiedCardActions; 