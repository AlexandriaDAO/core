import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/lib/components/dialog";
import { ShelfContent } from "./ShelfContent";
import { useAddToShelf } from "../hooks/useAddToShelf";
import { ShelfManagerProps } from "../types";

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
  
  const {
    getEditableShelves,
    addContentToShelf,
    hasEditableShelvesExcluding,
    isLoggedIn
  } = useAddToShelf();
  
  // Check if user has shelves they can edit
  const hasAvailableShelves = hasEditableShelvesExcluding(currentShelfId);
  if (!hasAvailableShelves || !isLoggedIn) return null;
  
  // Get shelves that the user can edit, filtering out the current shelf
  const editableShelves = getEditableShelves(currentShelfId);
  
  // Filter shelves based on search term
  const filteredShelves = editableShelves.filter(shelf => {
    if (searchTerm === "") return true;
    
    const title = typeof shelf.title === 'string' ? shelf.title.toLowerCase() : '';
    const description = typeof shelf.description?.[0] === 'string' ? shelf.description[0].toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    
    return title.includes(search) || description.includes(search);
  });

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

  // Reset state when dialog closes
  const handleDialogClose = () => {
    setSelectedShelfId(null);
    setSearchTerm("");
    onClose();
  };

  // Handle click on dialog content to prevent click-through
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md" onClick={handleContentClick}>
        <DialogHeader>
          <DialogTitle>Add to Shelf</DialogTitle>
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
      </DialogContent>
    </Dialog>
  );
}; 