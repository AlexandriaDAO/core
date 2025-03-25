import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/lib/components/scroll-area";
import { Button } from "@/lib/components/button";
import { useAddToShelf } from "../../shelf-management/hooks/useAddToShelf";
import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";

interface AddToShelfDialogProps {
  open: boolean;
  onClose: () => void;
  contentId: string;
  contentType: "Nft" | "Markdown" | "Shelf";
  excludeShelfId?: string;
}

/**
 * Dialog for selecting a shelf to add content to
 * 
 * This component displays a dialog with a list of shelves the user has edit access to,
 * allowing them to select a target shelf to add the content to.
 */
export const AddToShelfDialog: React.FC<AddToShelfDialogProps> = ({
  open,
  onClose,
  contentId,
  contentType,
  excludeShelfId
}) => {
  const [selectedShelfId, setSelectedShelfId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAddingContent, setIsAddingContent] = React.useState(false);
  
  const {
    getEditableShelves,
    addContentToShelf,
    hasEditableShelvesExcluding,
    isLoggedIn
  } = useAddToShelf();
  
  // Check if user has shelves they can edit
  const hasAvailableShelves = hasEditableShelvesExcluding(excludeShelfId);
  if (!hasAvailableShelves || !isLoggedIn) return null;
  
  // Get shelves that the user can edit, filtering out the current shelf
  const editableShelves = getEditableShelves(excludeShelfId);
  
  // Filter shelves based on search term
  const filteredShelves = editableShelves.filter((shelf: Shelf) => {
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

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
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
              {filteredShelves.map((shelf: Shelf) => (
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
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddToShelf} 
            disabled={!selectedShelfId || isAddingContent}
          >
            {isAddingContent ? "Adding..." : "Add to Shelf"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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