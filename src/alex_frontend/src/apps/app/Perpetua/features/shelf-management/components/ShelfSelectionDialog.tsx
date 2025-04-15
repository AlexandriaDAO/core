import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/lib/components/dialog";
import { Loader2 } from "lucide-react";
import { ShelfContent } from "./ShelfContent";
import { useAddToShelf } from "../hooks/useAddToShelf";
import { ShelfManagerProps } from "../../../types/shelf.types";
import { NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { Principal } from "@dfinity/principal";
import { Shelf } from "@/../../declarations/perpetua/perpetua.did";

/**
 * Convert a NormalizedShelf back to a Shelf for API calls and components
 */
const denormalizeShelf = (normalizedShelf: NormalizedShelf): Shelf => ({
  ...normalizedShelf,
  owner: Principal.fromText(normalizedShelf.owner)
} as Shelf);

/**
 * Convert an array of NormalizedShelf objects to Shelf objects
 */
const denormalizeShelves = (normalizedShelves: NormalizedShelf[]): Shelf[] => 
  normalizedShelves.map(denormalizeShelf);

interface ShelfSelectionDialogProps extends ShelfManagerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog component for selecting a shelf to add content to
 * 
 * This component provides a standardized interface for adding any content
 * type to shelves that the user has permission to edit.
 */
export const ShelfSelectionDialog: React.FC<ShelfSelectionDialogProps> = ({
  contentId,
  contentType,
  currentShelfId,
  open,
  onClose
}) => {
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    getEditableShelves,
    addContentToShelf,
    hasEditableShelvesExcluding,
    isLoggedIn,
    shelvesLoading
  } = useAddToShelf();
  
  // This effect runs when the dialog is opened
  useEffect(() => {
    if (open) {
      // Set loading state based on whether shelves are still loading from the backend
      setIsLoading(shelvesLoading);
    }
  }, [open, shelvesLoading]);
  
  // Reset state when dialog closes
  const handleDialogClose = () => {
    setSelectedShelfId(null);
    setSearchTerm("");
    onClose();
  };
  
  // Handle selection of a shelf
  const handleShelfSelection = (shelfId: string) => {
    setSelectedShelfId(shelfId === selectedShelfId ? null : shelfId);
  };
  
  // Handle adding content to selected shelf
  const handleAddToShelf = async () => {
    if (!selectedShelfId) return;
    
    setIsAddingContent(true);
    try {
      const success = await addContentToShelf(selectedShelfId, contentId, contentType);
      if (success) {
        onClose();
      }
    } finally {
      setIsAddingContent(false);
    }
  };
  
  // Check conditions for rendering content
  const canShowContent = isLoggedIn && hasEditableShelvesExcluding(currentShelfId);
  
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
        ) : !hasEditableShelvesExcluding(currentShelfId) ? (
          <div className="flex flex-col items-center justify-center py-8 text-center font-serif">
            <h3 className="text-lg font-semibold">No Shelves Available</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You don't have any shelves you can edit. Create a shelf first.
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
              isAddingContent={isAddingContent}
              onAddToShelf={handleAddToShelf}
              onClose={handleDialogClose}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 