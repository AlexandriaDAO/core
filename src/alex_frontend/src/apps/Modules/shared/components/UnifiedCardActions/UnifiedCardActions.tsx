import React from "react";
import { Plus, Trash2, UserPlus, UserMinus, Loader2, Heart, Bookmark, PlusCircle } from "lucide-react";
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
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did"; // Import ShelfPublic for type hints
import { Badge } from "@/lib/components/badge";
import { formatBalance } from '@/apps/Modules/shared/utils/tokenUtils';
import { Percent } from "lucide-react"; // Icon for rarity badge

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
  containerClassName?: string; // New prop for styling the main container
}

// Type for the context needed by the dialog and background processing
interface AddToShelfContext {
    originalContentId: string;
    originalContentType: UnifiedCardActionsProps['contentType'];
    initialIsOwned: boolean;
    isSafe?: boolean;
    currentShelfId?: string; // Pass currentShelfId for exclusion in dialog
}

// Wrap component with React.memo
export const UnifiedCardActions: React.FC<UnifiedCardActionsProps> = React.memo(({
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
  className,
  containerClassName
}) => {
  const [addToShelfContext, setAddToShelfContext] = React.useState<AddToShelfContext | null>(null);
  const [isProcessingAddToShelf, setIsProcessingAddToShelf] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const [isProcessingDirectMint, setIsProcessingDirectMint] = React.useState(false); // New state for direct minting

  const { addContentToShelf, isLoggedIn, getEditableShelves } = useAddToShelf();
  const { createShelf } = useShelfOperations();
  // Removed user, currentUserPrincipal, removeItem, shelves, checkEditAccess, isFollowingUser, toggleFollowUser as they relate to removed actions
  // const { user } = useSelector((state: RootState) => state.auth);
  // const currentUserPrincipal = user?.principal;
  // const { removeItem, shelves } = useShelfOperations(); // Removed
  // const { checkEditAccess } = useContentPermissions(); // Removed
  // const { isFollowingUser, toggleFollowUser } = useFollowStatus(); // Removed

  // --- Access NFT Data for Badges ---
  // const allNfts = useSelector((state: RootState) => state.nftData.nfts); // Keep for now if other parts rely on it directly, but try to minimize.
  const arweaveToNftId = useSelector((state: RootState) => state.nftData.arweaveToNftId);

  const actualNftTokenId = React.useMemo(() => {
    if (contentId && arweaveToNftId[contentId]) {
      return arweaveToNftId[contentId];
    } else if (contentType === 'Nft') {
      return contentId;
    }
    // For 'Arweave' type, if not in arweaveToNftId, it remains undefined.
    // For 'Markdown' or 'Shelf', it also remains undefined.
    return undefined;
  }, [contentId, contentType, arweaveToNftId]);

  const nftDetails = useSelector((state: RootState) => {
    if (!actualNftTokenId) return undefined;
    const nft = state.nftData.nfts[actualNftTokenId];
    if (!nft) return undefined;
    return {
      balances: nft.balances,
      rarityPercentage: nft.rarityPercentage,
      collection: nft.collection,
    };
  }, (left, right) => {
    if (left === right) return true;
    if (!left || !right) return false;

    let balancesEqual = false;
    if (!left.balances && !right.balances) {
      balancesEqual = true;
    } else if (left.balances && right.balances) {
      balancesEqual = left.balances.alex === right.balances.alex && 
                      left.balances.lbry === right.balances.lbry;
    } else {
      // One has balances, the other doesn't
      balancesEqual = false;
    }

    return (
      balancesEqual &&
      left.rarityPercentage === right.rarityPercentage &&
      left.collection === right.collection
    );
  });

  // Fallback if allNfts is still needed elsewhere, otherwise it can be removed.
  // For nftDataItem, prefer using the more granularly selected `nftDetails`.
  // const nftDataItem = actualNftTokenId ? useSelector((state: RootState) => state.nftData.nfts[actualNftTokenId]) : undefined;
  // Let's adjust logic to use nftDetails primarily.

  const alexBalance = nftDetails?.balances?.alex;
  const lbryBalance = nftDetails?.balances?.lbry;
  const rarityPercentage = nftDetails?.rarityPercentage;
  const isItemAnNftCollection = nftDetails?.collection === 'NFT';


  // Helper to format rarity percentage
  const formatRarityDisplay = (rarity: number | undefined): string => {
    if (rarity === undefined || rarity === null || rarity < 0) { // Handles "not ranked" (-1) or undefined
      return ""; // Don't display if not ranked or not available
    }
    return `${(rarity / 100).toFixed(2)}%`;
  };

  // Helper to format LBRY balance as dollars
  const formatLbryToDollars = (lbryAmount: string | undefined): string => {
    if (!lbryAmount) return "";
    const numericAmount = parseFloat(lbryAmount);
    if (isNaN(numericAmount)) return "";
    return `$${(numericAmount / 100).toFixed(2)}`;
  };

  // Conditions for showing badges
  const rarityFormatted = formatRarityDisplay(rarityPercentage);

  // --- Log values for badge conditions ---
  console.log(`[UnifiedCardActions Debug] contentId: ${contentId}, contentType: ${contentType}`);
  console.log(`[UnifiedCardActions Debug] actualNftTokenId: ${actualNftTokenId}`);
  console.log(`[UnifiedCardActions Debug] nftDetails:`, nftDetails);
  console.log(`[UnifiedCardActions Debug] alexBalance: ${alexBalance}, lbryBalance: ${lbryBalance}, rarityPercentage: ${rarityPercentage}`);
  console.log(`[UnifiedCardActions Debug] isItemAnNftCollection: ${isItemAnNftCollection}`);
  console.log(`[UnifiedCardActions Debug] rarityFormatted: ${rarityFormatted}`);

  const showAlexBadge = !!alexBalance && parseFloat(alexBalance) > 0;
  const showLbryBadge = !!lbryBalance && parseFloat(lbryBalance) > 0;
  // Show rarity badge if it's an NFT by collection type and has a valid, formatted rarity string
  const showRarityBadge = isItemAnNftCollection && rarityFormatted !== "";
  const lbryDollarAmount = formatLbryToDollars(lbryBalance);

  // --- Log evaluated conditions ---
  console.log(`[UnifiedCardActions Debug] showAlexBadge: ${showAlexBadge}, showLbryBadge: ${showLbryBadge}, showRarityBadge: ${showRarityBadge}`);


  // --- Determine Action Availability ---

  // Condition for an item being potentially mintable (unowned NFT or Arweave)
  const conditionsMetForPotentialMint = !isOwned && (contentType === 'Nft' || contentType === 'Arweave');

  // Can Add to Shelf: User must be logged in.
  // If the item is potentially mintable, it must also be safe for minting.
  const canAddToShelf = isLoggedIn && (!conditionsMetForPotentialMint || isSafeForMinting);

  // Condition for showing the direct mint button
  const canDirectMint = isLoggedIn && conditionsMetForPotentialMint && isSafeForMinting;

  // Determine if anything at all needs to be rendered
  const shouldShowAnyBadge = showAlexBadge || showLbryBadge || showRarityBadge;
  const shouldShowAnyActionButton = canAddToShelf || canDirectMint;

  if (!shouldShowAnyBadge && !shouldShowAnyActionButton) {
    return null; // Return null only if there's absolutely nothing to display
  }

  const stopPropagation = (e: React.MouseEvent | React.TouchEvent | Event) => {
    e.stopPropagation();
    // Prevent default link navigation if the button is inside an anchor tag
    if (e.cancelable) {
      e.preventDefault();
    }
  };


  // --- Action Handlers ---

  // Refactored Minting Operation
  const performMintOperation = async (
    originalContentId: string,
    originalContentType: UnifiedCardActionsProps['contentType']
  ): Promise<{ finalContentId: string; finalContentType: 'Nft' | 'Shelf' | 'Markdown'; mintStatus: MintResult['status'] | 'not_needed' | 'failed_precheck'; mintMessage?: string }> => {
    if (!isLoggedIn) {
      return { finalContentId: originalContentId, finalContentType: originalContentType as any, mintStatus: 'failed_precheck', mintMessage: "User not logged in." };
    }
    if ((originalContentType === 'Arweave' || originalContentType === 'Nft') && !isSafeForMinting && !isOwned) { // Check isOwned here for Arweave
        return { finalContentId: originalContentId, finalContentType: originalContentType as any, mintStatus: 'failed_precheck', mintMessage: "Content is not safe for minting or already owned." };
    }

    let finalContentId = originalContentId;
    let finalContentType: "Nft" | "Shelf" | "Markdown" = originalContentType as any; // Initial assumption
    let needsMinting = false;

    if (!isOwned && (originalContentType === 'Nft' || originalContentType === 'Arweave')) {
        needsMinting = true;
    } else if (originalContentType === 'Shelf') {
        finalContentType = 'Shelf';
    } else if (originalContentType === 'Markdown') {
        finalContentType = 'Markdown';
    } else { // Already owned Nft/SBT
        finalContentType = 'Nft';
    }

    if (needsMinting) {
        console.log(`[UnifiedCardActions] Minting required for ${originalContentType} ID: ${originalContentId}`);
        const mintResult = await mint_nft(originalContentId);
        if (mintResult.status === 'success' || mintResult.status === 'already_exists') {
            finalContentId = mintResult.id;
            finalContentType = 'Nft';
            return { finalContentId, finalContentType, mintStatus: mintResult.status };
        } else {
            console.error(`[UnifiedCardActions] Minting failed: ${mintResult.message}`);
            return { finalContentId: originalContentId, finalContentType: originalContentType as any, mintStatus: 'error', mintMessage: mintResult.message || "Failed to acquire item." };
        }
    }
    // If no minting was needed
    return { finalContentId, finalContentType, mintStatus: 'not_needed' };
  };


  // 1. Initial Click Handler for Add to Shelf: Perform checks and open dialog
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

  // 2. Background Processor: Called after dialog confirms selection
  const processAddToShelfInBackground = async (selectedShelfIds: string[]) => {
    // console.log("[UnifiedCardActions] processAddToShelfInBackground called. Selected IDs:", selectedShelfIds, "Context exists:", !!addToShelfContext);
    if (!addToShelfContext) {
        console.error("[UnifiedCardActions] Background process called without context.");
        toast.error("An unexpected error occurred (missing context).");
        return;
    }
    if (selectedShelfIds.length === 0) {
        console.warn("[UnifiedCardActions] Background process called with empty selection.");
        return; // Nothing to do
    }

    const { originalContentId, originalContentType, initialIsOwned, isSafe } = addToShelfContext;
    let finalContentId = originalContentId;
    let finalContentType: "Nft" | "Shelf" | "Markdown" = 'Nft'; // Default, will be adjusted
    let needsMinting = false;

    // Fetch shelf details for toast messages *before* starting async operations
    // Note: getEditableShelves returns NormalizedShelf[], need to denormalize for ShelfPublic
    // Let's assume denormalizeShelves is available or implement it inline if needed
    const allEditableShelves = getEditableShelves(); // Assuming this returns NormalizedShelf[]
    // Inline denormalization for simplicity if needed:
    const denormalizeShelf = (normalizedShelf: NormalizedShelf): ShelfPublic => ({
        ...normalizedShelf,
        owner: Principal.fromText(normalizedShelf.owner),
        created_at: BigInt(normalizedShelf.created_at),
        updated_at: BigInt(normalizedShelf.updated_at)
    } as ShelfPublic);
    const denormalizedShelves = allEditableShelves.map(denormalizeShelf);
    const shelfDetailsMap = new Map(denormalizedShelves.map(shelf => [shelf.shelf_id, shelf]));

    setIsProcessingAddToShelf(true); // Indicate background processing starts

    try {
        // Determine if minting is needed (only needs to happen once)
        if (!initialIsOwned && (originalContentType === 'Nft' || originalContentType === 'Arweave')) {
            needsMinting = true;
        } else if (originalContentType === 'Shelf') {
            finalContentType = 'Shelf';
        } else if (originalContentType === 'Markdown') {
            finalContentType = 'Markdown';
        } else {
            // Already owned Nft/SBT
            finalContentType = 'Nft';
        }

        // Perform minting if required (once for all selected shelves)
        if (needsMinting) {
            const mintingOutcome = await performMintOperation(originalContentId, originalContentType);

            if (mintingOutcome.mintStatus === 'error' || mintingOutcome.mintStatus === 'failed_precheck') {
                toast.error(mintingOutcome.mintMessage || "Failed to acquire item for adding.");
                throw new Error(mintingOutcome.mintMessage || "Minting prerequisite failed");
            }
            
            finalContentId = mintingOutcome.finalContentId; // Update finalContentId after minting
            finalContentType = mintingOutcome.finalContentType; // Update finalContentType after minting

            // If minting was successful (or item already existed), provide some feedback
            if (mintingOutcome.mintStatus === 'success' || mintingOutcome.mintStatus === 'already_exists') {
                toast.info(`Item acquired successfully. Adding to shelves...`);
            }
        }

        // Determine collectionType for NFTs/SBTs (once)
        const collectionType = (finalContentType === 'Nft' && finalContentId.length >= 80) ? 'SBT' : (finalContentType === 'Nft' ? 'NFT' : undefined);

        // Add to each selected shelf concurrently
        // console.log(`[UnifiedCardActions] Preparing to call addContentToShelf for ${selectedShelfIds.length} shelves. Content ID: ${finalContentId}, Type: ${finalContentType}`);
        const addPromises = selectedShelfIds.map(shelfId =>
            addContentToShelf(
                shelfId,
                finalContentId,
                finalContentType,
                collectionType
            )
            .then(result => ({ ...result, shelfId })) // Pass shelfId along for context in success
            .catch(error => ({ status: 'error', message: error?.message || "Unknown error", shelfId })) // Catch and format errors
        );

        // Wait for all attempts to settle
        const results = await Promise.allSettled(addPromises);

        // Process results and show individual toasts
        results.forEach(result => {
            let shelfId: string | undefined;
            let shelfName = 'selected shelf';

            if (result.status === 'fulfilled') {
                shelfId = result.value.shelfId;
                const shelfInfo = shelfDetailsMap.get(shelfId);
                shelfName = shelfInfo?.title || `shelf ID ${shelfId || 'unknown'}`; 

                if (result.value.status === 'success') {
                    toast.success(`Successfully added ${finalContentType === 'Shelf' ? 'shelf' : 'item'} to '${shelfName}'.`);
                } else if (result.value.status === 'error') {
                    toast.error(`Failed to add ${finalContentType === 'Shelf' ? 'shelf' : 'item'} to '${shelfName}': ${result.value.message}`);
                } else if (result.value.status === 'already_on_shelf') { // Handle new status
                    toast.info(`Item is already on '${shelfName}'.`);
                } else {
                    console.warn("Unexpected fulfilled status:", result.value);
                    toast.error(`An unexpected issue occurred when adding to '${shelfName}'.`);
                }
            } else { // result.status === 'rejected'
                const reason = result.reason as any;
                shelfId = reason?.shelfId;
                const shelfInfo = shelfId ? shelfDetailsMap.get(shelfId) : undefined;
                shelfName = shelfInfo?.title || `shelf ID ${shelfId || 'unknown'}`; 
                const errorMessage = reason?.message || reason?.toString() || "An unknown error occurred";
                toast.error(`Failed to add ${finalContentType === 'Shelf' ? 'shelf' : 'item'} to '${shelfName}': ${errorMessage}`);
            }
        });

    } catch (error) {
        console.error("[UnifiedCardActions] Error during background add-to-shelf process:", error);
        // Avoid double-toasting if minting failed and threw
        if (!(error instanceof Error && error.message === "Minting failed")) {
           toast.error(error instanceof Error ? error.message : "An unexpected error occurred while adding the item(s).");
        }
    } finally {
        setIsProcessingAddToShelf(false); // Indicate background processing finished
        setAddToShelfContext(null); // Clear context
    }
  };

  // 3. Handler for Direct Minting
  const handleDirectMintClick = async (e: React.MouseEvent) => {
    stopPropagation(e);

    if (!isLoggedIn) {
      toast.error("Please log in to mint items.");
      return;
    }
    // Safety check is part of performMintOperation for Arweave
    // if (contentType === 'Arweave' && !isSafeForMinting) {
    //     toast.error("Cannot mint potentially unsafe content.");
    //     return;
    // }

    console.log(`[UnifiedCardActions] Initiating direct mint for ${contentType} ID: ${contentId}`);
    setIsProcessingDirectMint(true);

    try {
      const mintingOutcome = await performMintOperation(contentId, contentType);

      if (mintingOutcome.mintStatus === 'success') {
        toast.success(`Item (ID: ${mintingOutcome.finalContentId.substring(0,8)}...) minted successfully as NFT!`);
      } else if (mintingOutcome.mintStatus === 'already_exists') {
        toast.info(`You already own this item (NFT ID: ${mintingOutcome.finalContentId.substring(0,8)}...).`);
      } else if (mintingOutcome.mintStatus === 'not_needed') {
         // This case should ideally not be hit if button is conditioned on !isOwned
        toast.info("This item doesn't need minting or is already an NFT you own.");
      } else { // error or failed_precheck
        toast.error(mintingOutcome.mintMessage || "Minting failed. Please try again.");
      }
    } catch (error) {
      console.error("[UnifiedCardActions] Error during direct mint process:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred during minting.");
    } finally {
      setIsProcessingDirectMint(false);
    }
  };


  return (
    <>
      {/* Top-left badges container - Render if any badge should be shown */}
      {shouldShowAnyBadge && (
        <div className="absolute left-1 top-1 z-30 flex flex-col items-start space-y-0.5 p-1 rounded-md bg-black/20 backdrop-blur-[2px] shadow-lg">
          {/* Prestigious Rarity Badge */}
          {showRarityBadge && (
            <Badge 
              variant="default" // Use default or a custom variant if set up
              className="text-[10px] h-6 px-2 py-1 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-black border border-yellow-700 shadow-md flex items-center font-semibold"
              title={`Rarity: ${rarityFormatted}`}
            >
              {rarityFormatted}
            </Badge>
          )}

          {/* Smaller ALEX and LBRY badges below rarity */}
          {(showAlexBadge || showLbryBadge) && (
            <div className="flex flex-row items-center space-x-0.5 mt-0.5">
              {showAlexBadge && (
                <Badge 
                  variant="secondary" 
                  className="text-[8px] h-4 px-1 py-0 bg-gradient-to-br from-gold-400 via-yellow-500 to-gold-600 text-black border border-yellow-700 shadow-sm"
                  title={`ALEX Balance: ${alexBalance}`}
                >
                  {alexBalance} ALEX
                </Badge>
              )}
              {showLbryBadge && (
                <Badge 
                  variant="secondary" 
                  className="text-[8px] h-4 px-1 py-0 bg-gradient-to-br from-gold-400 via-yellow-500 to-gold-600 text-black border border-yellow-700 shadow-sm"
                  title={`LBRY Balance: ${lbryBalance} (approx. ${lbryDollarAmount})`}
                >
                  {lbryDollarAmount}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action buttons container - Render if any action button should be shown */}
      {shouldShowAnyActionButton && (
        <div 
          className={containerClassName !== undefined ? containerClassName : "absolute right-3 top-0 z-30 flex flex-col items-end space-y-1"}
        >
          {/* Add to Shelf (Bookmark) Button - only if canAddToShelf is true */}
          {canAddToShelf && (
            <div 
              className={`cursor-pointer ${className ?? ""}`}
              onClick={isProcessingDirectMint || isProcessingAddToShelf ? undefined : handleAddToShelfClick}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              aria-label={isProcessingAddToShelf ? "Adding to shelf..." : "Add to shelf"}
              title="Add to Shelf"
            >
              <div className="relative">
                {/* Bookmark shadow */}
                <div className="absolute top-0.5 right-0 h-10 w-8 bg-black/30 rounded-b-md blur-[1px]"></div>
                
                {/* Bookmark shape - using same black as info button */}
                <div className="relative h-10 w-8 bg-black/75 transition-colors duration-150 rounded-b-md">
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
          )}

          {/* Direct Mint NFT Button - only if canDirectMint is true */}
          {canDirectMint && (
             <Button
              variant="secondary"
              onClick={isProcessingDirectMint || isProcessingAddToShelf ? undefined : handleDirectMintClick}
              disabled={isProcessingDirectMint || isProcessingAddToShelf}
              className="h-8 px-2 py-1 text-xs flex items-center gap-1 bg-black/75 hover:bg-black/90 text-white dark:text-brightyellow border-none shadow-md"
              title="Mint as NFT"
            >
              {isProcessingDirectMint ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" /> 
              )}
            </Button>
          )}
        </div>
      )}

      {addToShelfContext && (
        <ShelfSelectionDialog
          currentShelfId={addToShelfContext.currentShelfId}
          open={!!addToShelfContext}
          onConfirmSelection={processAddToShelfInBackground}
          onClose={() => {
            setAddToShelfContext(null);
            setIsProcessingAddToShelf(false); // Ensure spinner stops if closed early
          }}
          onCreateShelf={createShelf}
        />
      )}
    </>
  );
});

// Add display name for React.memo component for better debugging
UnifiedCardActions.displayName = 'UnifiedCardActions'; 