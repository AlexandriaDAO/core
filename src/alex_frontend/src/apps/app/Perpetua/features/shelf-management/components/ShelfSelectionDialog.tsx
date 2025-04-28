import React, { useState, useEffect, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/lib/components/dialog";
import { Loader2 } from "lucide-react";
import { ShelfContent, UpdatedShelfContentProps } from "./ShelfContent";
import { useAddToShelf } from "../hooks/useAddToShelf";
import { NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { Principal } from "@dfinity/principal";
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";

/**
 * Convert a NormalizedShelf back to a Shelf for API calls and components
 */
const denormalizeShelf = (normalizedShelf: NormalizedShelf): ShelfPublic => ({
  ...normalizedShelf,
  owner: Principal.fromText(normalizedShelf.owner),
  created_at: BigInt(normalizedShelf.created_at),
  updated_at: BigInt(normalizedShelf.updated_at)
} as ShelfPublic);

/**
 * Convert an array of NormalizedShelf objects to Shelf objects
 */
const denormalizeShelves = (normalizedShelves: NormalizedShelf[]): ShelfPublic[] => 
  normalizedShelves.map(denormalizeShelf);

interface ShelfSelectionDialogProps {
  // Context from the triggering component
  originalContentId: string;
  originalContentType: "Nft" | "Shelf" | "Markdown" | "Arweave";
  initialIsOwned: boolean;

  // UI and functionality props
  currentShelfId?: string; // ID of the shelf the item might currently be in (for exclusion)
  open: boolean;
  onClose: () => void;
  // Callback to trigger background processing after selection
  onConfirmSelection: (selectedShelfId: string) => void;
}

/**
 * Dialog component for selecting a shelf to add content to
 * 
 * This component provides a standardized interface for adding any content
 * type to shelves that the user has permission to edit.
 */
export const ShelfSelectionDialog: React.FC<ShelfSelectionDialogProps> = ({
  // originalContentId, // Not directly used in dialog logic, but kept for potential future use?
  // originalContentType, // Not directly used in dialog logic
  // initialIsOwned, // Not directly used in dialog logic
  currentShelfId,
  open,
  // onClose
  onClose,
  onConfirmSelection
}) => {
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    getEditableShelves,
    // addContentToShelf, // Removed, handled by caller now
    // hasEditableShelvesExcluding, // Filtering happens in getEditableShelves
    isLoggedIn,
    shelvesLoading
  } = useAddToShelf();
  
  // TODO: Get the function to trigger shelf creation
  // const { openCreateShelfModal } = useShelfCreation(); 

  // This effect runs when the dialog is opened
  useEffect(() => {
    if (open) {
      // Set loading state based on whether shelves are still loading from the backend
      setIsLoading(shelvesLoading);
    }
  }, [open, shelvesLoading]);
  
  // Reset state when dialog closes
  const handleDialogClose = useCallback(() => {
    setSelectedShelfId(null);
    setSearchTerm("");
    onClose();
  }, [onClose]);
  
  // Handle selection of a shelf
  const handleShelfSelection = (shelfId: string) => {
    setSelectedShelfId(shelfId === selectedShelfId ? null : shelfId);
  };
  
  // Handle confirming the shelf selection
  const handleAddToShelf = async () => {
    if (!selectedShelfId) return;
    
    console.log(`[ShelfSelectionDialog] Shelf selected: ${selectedShelfId}. Triggering background process.`);
    
    // Call the callback provided by the parent to handle the background logic
    onConfirmSelection(selectedShelfId);
    
    // Close the dialog immediately (Optimistic UI)
    handleDialogClose();
  };
  
  // New handler for the create shelf request
  const handleCreateNewShelfRequest = useCallback(() => {
    console.log("[ShelfSelectionDialog] Create New Shelf requested");
    handleDialogClose();
    // TODO: Trigger the actual shelf creation flow
    // if (openCreateShelfModal) { 
    //   openCreateShelfModal(); 
    // } else { 
    //   console.error("Shelf creation function not available!");
    // }
    alert("Trigger Create Shelf Flow! (Placeholder)");
  }, [handleDialogClose /*, openCreateShelfModal */]);
  
  // Check conditions for rendering content
  const canShowContent = isLoggedIn;
  
  // Get shelves data if we can show content
  const editableShelves = canShowContent ? getEditableShelves(currentShelfId) : [];
  
  // Filter shelves based on search term
  const filteredShelves = denormalizeShelves(
    editableShelves.filter((shelf: NormalizedShelf) => {
      if (!searchTerm) return true;
      
      const title = typeof shelf.title === 'string' ? shelf.title.toLowerCase() : '';
      const description = typeof shelf.description?.[0] === 'string' ? shelf.description[0].toLowerCase() : '';
      const search = searchTerm.toLowerCase();
      
      return title.includes(search) || description.includes(search);
    })
  );
  
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md font-serif" onClick={(e) => e.stopPropagation()}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 font-serif">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading shelves...</p>
          </div>
        ) : !isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-8 text-center font-serif">
            <h3 className="text-lg font-semibold">Login Required</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You need to be logged in to add content to shelves
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif">Add to Shelf</DialogTitle>
            </DialogHeader>
            
            <ShelfContent
              shelves={filteredShelves}
              selectedShelfId={selectedShelfId}
              onSelectShelf={handleShelfSelection}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              isAddingContent={false} // Dialog no longer handles adding state
              onAddToShelf={handleAddToShelf}
              onClose={handleDialogClose}
              onCreateNewShelfRequest={handleCreateNewShelfRequest}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 