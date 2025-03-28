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
import { NormalizedShelf } from "@/apps/Modules/shared/state/perpetua/perpetuaSlice";

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
  const filteredShelves = editableShelves.filter((shelf: NormalizedShelf) => {
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Shelf</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Input
            placeholder="Search shelves..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        
        <ScrollArea className="h-[50vh] max-h-96 overflow-y-auto">
          {filteredShelves.length > 0 ? (
            <div className="space-y-2">
              {filteredShelves.map((shelf) => (
                <ShelfOption
                  key={shelf.shelf_id}
                  shelf={shelf}
                  isSelected={selectedShelfId === shelf.shelf_id}
                  onSelect={handleShelfSelection}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? (
                <>No shelves match your search</>
              ) : (
                <>No shelves available</>
              )}
            </div>
          )}
        </ScrollArea>
        
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button 
            disabled={!selectedShelfId || isAddingContent} 
            onClick={handleAddToShelf}
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
  shelf: NormalizedShelf;
  isSelected: boolean;
  onSelect: (shelfId: string) => void;
}

const ShelfOption: React.FC<ShelfOptionProps> = ({ shelf, isSelected, onSelect }) => {
  return (
    <div
      className={`p-3 rounded-md cursor-pointer transition-colors
        ${isSelected ? 'bg-primary/10 border border-primary' : 'bg-card hover:bg-accent border border-border'}`}
      onClick={() => onSelect(shelf.shelf_id)}
    >
      <h3 className="font-medium text-sm mb-1 truncate">{shelf.title}</h3>
      {shelf.description && shelf.description[0] && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {shelf.description[0]}
        </p>
      )}
    </div>
  );
}; 