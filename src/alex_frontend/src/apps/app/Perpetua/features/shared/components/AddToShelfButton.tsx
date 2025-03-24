import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { ScrollArea } from "@/lib/components/scroll-area";
import { Plus, Search } from "lucide-react";
import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { useAddToShelf } from "../../shelf-management/hooks";

interface AddToShelfButtonProps {
  contentId: string;
  contentType: "Nft" | "Markdown" | "Shelf";
  currentShelfId?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

/**
 * A button component that allows adding content to a shelf
 * 
 * This component renders a plus button that, when clicked, opens a dialog
 * allowing the user to select a shelf to add the content to.
 */
export const AddToShelfButton: React.FC<AddToShelfButtonProps> = ({ 
  contentId, 
  contentType, 
  currentShelfId,
  position = "top-right" 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingContent, setIsAddingContent] = useState(false);
  
  const { 
    getEditableShelves, 
    addContentToShelf,
    hasEditableShelvesExcluding,
    isLoggedIn
  } = useAddToShelf();
  
  // Only render if user has shelves they can edit
  const hasAvailableShelves = hasEditableShelvesExcluding(currentShelfId);
  if (!hasAvailableShelves || !isLoggedIn) return null;
  
  // Get shelves that the user can edit, filtering out the current shelf
  const editableShelves = getEditableShelves(currentShelfId);
  
  // Filter shelves based on search term
  const filteredShelves = editableShelves.filter(shelf => {
    const title = typeof shelf.title === 'string' ? shelf.title.toLowerCase() : '';
    const description = typeof shelf.description?.[0] === 'string' ? shelf.description[0].toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    
    return title.includes(search) || description.includes(search);
  });

  // Get position classes based on the position prop
  const getPositionClasses = (pos: string) => {
    switch (pos) {
      case "top-right": return "top-2 right-2";
      case "top-left": return "top-2 left-2";
      case "bottom-right": return "bottom-2 right-2";
      case "bottom-left": return "bottom-2 left-2";
      default: return "top-2 right-2";
    }
  };

  const handleShelfSelection = (shelfId: string) => {
    setSelectedShelfId(shelfId === selectedShelfId ? null : shelfId);
  };

  const handleAddToShelf = async () => {
    if (!selectedShelfId) return;
    
    setIsAddingContent(true);
    try {
      const success = await addContentToShelf(selectedShelfId, contentId, contentType);
      if (success) {
        setDialogOpen(false);
      }
    } finally {
      setIsAddingContent(false);
    }
  };

  // Reset state when dialog closes
  const handleDialogClose = () => {
    setSelectedShelfId(null);
    setSearchTerm("");
    setDialogOpen(false);
  };
  
  return (
    <>
      {/* Button to trigger the dialog */}
      <Button 
        onClick={(e) => { 
          e.stopPropagation(); 
          e.preventDefault(); 
          setDialogOpen(true);
        }}
        className={`absolute ${getPositionClasses(position)} z-10 bg-background/80 backdrop-blur-sm h-8 w-8 p-0`}
        variant="secondary"
      >
        <Plus className="h-4 w-4" />
      </Button>
      
      {/* Dialog for shelf selection */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Shelf</DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shelves..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <ScrollArea className="max-h-[300px] mt-2">
            {filteredShelves.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {editableShelves.length === 0 
                  ? "You don't have any shelves you can edit" 
                  : "No shelves match your search"}
              </div>
            ) : (
              <div className="space-y-2 p-1">
                {filteredShelves.map((shelf) => (
                  <ShelfOption
                    key={shelf.shelf_id}
                    shelf={shelf}
                    isSelected={selectedShelfId === shelf.shelf_id}
                    onSelect={handleShelfSelection}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddToShelf} 
              disabled={!selectedShelfId || isAddingContent}
            >
              {isAddingContent ? "Adding..." : "Add to Shelf"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper component for shelf selection
interface ShelfOptionProps {
  shelf: Shelf;
  isSelected: boolean;
  onSelect: (shelfId: string) => void;
}

const ShelfOption: React.FC<ShelfOptionProps> = ({ shelf, isSelected, onSelect }) => {
  return (
    <div
      className={`p-3 rounded-md cursor-pointer transition-colors ${
        isSelected 
          ? "bg-primary/10 border border-primary" 
          : "hover:bg-secondary border border-transparent"
      }`}
      onClick={() => onSelect(shelf.shelf_id)}
    >
      <div className="font-medium">{shelf.title}</div>
      <div className="text-sm text-muted-foreground line-clamp-1">
        {shelf.description?.[0] || ""}
      </div>
    </div>
  );
}; 