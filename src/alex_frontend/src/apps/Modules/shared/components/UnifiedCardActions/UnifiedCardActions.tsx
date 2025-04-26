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


interface UnifiedCardActionsProps {
  contentId: string; // Arweave ID, Shelf ID, NFT Nat ID string
  contentType: "Nft" | "Shelf" | "Markdown" | "Arweave"; // Added 'Arweave'
  ownerPrincipal?: Principal; // Owner for follow/permission checks
  isOwned: boolean; // Does the current user own this specific item?
  isLikable?: boolean; // Can this UNOWNED item be liked/minted?
  onLike?: () => Promise<string | null>; // Function to call for liking/minting, returns new Nat ID string or null
  // Context for other actions
  currentShelfId?: string; // The shelf the item is currently displayed in (if any)
  parentShelfId?: string; // The shelf this item belongs to (for removal)
  itemId?: number; // ID of the item within its parent shelf (for removal)
  // UI state
  onToggleDetails: () => void; // Callback to toggle details visibility
  showDetails: boolean; // Are details currently visible?
  className?: string;
  // Removed: isOwnedNft, isMintableNft, onMint, isMinting - replaced by isOwned, isLikable, onLike
}

export const UnifiedCardActions: React.FC<UnifiedCardActionsProps> = ({
  contentId,
  contentType,
  ownerPrincipal,
  isOwned,
  isLikable = false, // Default to false if not provided
  onLike,
  currentShelfId,
  parentShelfId,
  itemId,
  onToggleDetails,
  showDetails,
  className
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [dialogContentId, setDialogContentId] = React.useState<string | null>(null);
  const [dialogContentType, setDialogContentType] = React.useState<'Nft' | 'Shelf' | 'Markdown' | null>(null); // Store type for dialog
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  const [likeAndAddLoading, setLikeAndAddLoading] = React.useState(false); // Loading state for the like+add operation

  const { hasEditableShelvesExcluding, isLoggedIn } = useAddToShelf();
  const { user } = useSelector((state: RootState) => state.auth);
  const currentUserPrincipal = user?.principal;
  const { removeItem } = useShelfOperations();
  const { checkEditAccess } = useContentPermissions();
  const { isFollowingUser, toggleFollowUser } = useFollowStatus();

  const hasAvailableShelves = hasEditableShelvesExcluding(currentShelfId);

  // --- Determine Action Availability ---

  // Can Add to Shelf: Logged in, has shelves, and it's any content type
  const canAddToShelf = isLoggedIn && hasAvailableShelves;

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
  const showAnyAction = canAddToShelf || canRemoveItem || canInteractWithFollow; // Add to shelf is always primary if available
  const showSeparator1 = (canAddToShelf || canRemoveItem) && canInteractWithFollow; // Separator needed if primary actions and follow action exist

  // If no actions are available, don't render anything
  if (!showAnyAction) {
    return null;
  }

  const stopPropagation = (e: React.MouseEvent | React.TouchEvent | Event) => {
    e.stopPropagation();
    // Only prevent default for non-Events (like mouse/touch) to allow dropdown trigger behavior
    if (!(e instanceof Event)) {
      e.preventDefault();
    }
  };

  // --- Action Handlers ---

  const openShelfDialog = (id: string, type: 'Nft' | 'Shelf' | 'Markdown') => {
    setDialogContentType(type);
    setDialogContentId(id);
  };

  const handleAddToShelfClick = async (e: React.MouseEvent) => {
    stopPropagation(e);
    setMenuOpen(false);

    if (!isLoggedIn) {
      toast.error("Please log in to add items to a shelf.");
      return;
    }
    if (!hasAvailableShelves) {
      toast.error("You don't have any shelves you can add to. Create one first!");
      return;
    }

    // Handle Shelf or Markdown directly
    if (contentType === 'Shelf' || contentType === 'Markdown') {
      openShelfDialog(contentId, contentType);
      return;
    }

    // Handle Nft or Arweave
    if (contentType === 'Nft' || contentType === 'Arweave') {
      if (isOwned) {
        // Owned items (must be Nft or treated as Nft if Arweave context but already owned)
        openShelfDialog(contentId, 'Nft');
      } else if (isLikable && onLike) {
        // Not owned, but likable -> Like/Mint first
        setLikeAndAddLoading(true);
        try {
          const newlyMintedId = await onLike();
          if (newlyMintedId) {
            toast.success("Item liked! Now add it to a shelf.");
            // Use timeout to ensure state updates propagate before opening dialog
            setTimeout(() => openShelfDialog(newlyMintedId, 'Nft'), 0);
          } else {
            // Error likely handled within onLike (toast shown there)
            // console.warn("onLike completed but returned null/undefined. No shelf dialog opened."); // Removed console log
          }
        } catch (error) {
          console.error("Error during onLike execution:", error);
          // Ensure a generic error is shown if onLike fails unexpectedly
          if (!(error instanceof Error && error.message.includes("already own")) && !(error instanceof Error && error.message.includes("already minted"))) {
             toast.error("Failed to like the item. Please try again.");
          }
        } finally {
          setLikeAndAddLoading(false);
        }
      } else {
        // This case should ideally not be reachable if button visibility is correct
        console.error("Add to Shelf clicked for unowned/unlikeable item without onLike handler.", { contentType, isOwned, isLikable });
        toast.error("Cannot add this item to a shelf at the moment.");
      }
      return;
    }

    // Fallback/Error case - Should not happen with current types
    console.error("Unhandled contentType in handleAddToShelfClick:", contentType);
    toast.error("An unexpected error occurred.");
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    stopPropagation(e);
    setRemoveDialogOpen(true);
    setMenuOpen(false);
  };

  const handleRemoveConfirm = async (e: React.MouseEvent) => {
    stopPropagation(e);
    if (!parentShelfId || itemId === undefined) return;

    setRemoveDialogOpen(true); // Keep dialog open while processing
    try {
      await removeItem(parentShelfId, itemId);
      toast.success("Item removed from shelf");
      setRemoveDialogOpen(false); // Close on success
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Error removing item from shelf");
      // Optionally keep dialog open on error: setRemoveDialogOpen(false);
    } finally {
      // Ensure dialog is closed if not already closed on success
       if (removeDialogOpen) setRemoveDialogOpen(false);
    }
  };

  const handleToggleFollowOwner = async (e: React.MouseEvent) => {
    stopPropagation(e);
    if (!canInteractWithFollow || !(ownerPrincipal instanceof Principal)) return;

    setFollowLoading(true);
    setMenuOpen(false);
    try {
      await toggleFollowUser(ownerPrincipal);
      // Toast is handled within useFollowStatus hook
    } catch (error) {
      console.error("Error toggling follow state:", error);
      // Avoid duplicate toasts if hook handles it
      // toast.error("Failed to update follow status.");
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
            onClick={(e) => {
              // Stop propagation for the button click itself to prevent card click
              stopPropagation(e);
              // Allow the trigger default behavior to open/close the menu
              // Do not manually call setMenuOpen here
            }}
            aria-label="Open actions menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        {/* Use stopPropagation on Content to prevent clicks inside menu from closing it or triggering card actions */}
        <DropdownMenuContent align="end" onClick={stopPropagation} className="w-52">
          {/* Add to Shelf (Handles Like+Add internally) */}
          {canAddToShelf && (
            <DropdownMenuItem
              onClick={handleAddToShelfClick}
              disabled={likeAndAddLoading}
              className="cursor-pointer"
            >
              {likeAndAddLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bookmark className="h-4 w-4 mr-2" />
              )}
              {likeAndAddLoading ? 'Liking...' : 'Add to shelf'}
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

          {/* Separator */}
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

      {/* Add to Shelf Dialog */}
      {/* Only render the dialog when we have a valid ID and Type */}
      {dialogContentId && dialogContentType && (
        <ShelfSelectionDialog
          contentId={dialogContentId}
          contentType={dialogContentType} // Type is already correct
          currentShelfId={currentShelfId}
          open={!!dialogContentId} // Control visibility directly
          onClose={() => {
            setDialogContentId(null);
            setDialogContentType(null);
          }}
        />
      )}

      {/* Remove Item Confirmation Dialog */}
      {removeDialogOpen && canRemoveItem && (
        <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          {/* Use stopPropagation on Content to prevent clicks inside closing dialog accidentally */}
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