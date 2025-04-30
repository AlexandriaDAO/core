import React, { useState, useEffect, useCallback, useMemo } from "react";
// Restore original dialog imports
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/lib/components/dialog";
import { Loader2 } from "lucide-react";
import { useAddToShelf } from "../hooks/useAddToShelf";
import { NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { Principal } from "@dfinity/principal";
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";
import { toast } from 'sonner';
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";

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
  currentShelfId?: string; 
  open: boolean;
  onClose: () => void;
  onConfirmSelection: (selectedShelfId: string) => void;
  onCreateShelf: (title: string, description: string) => Promise<string | null | undefined>;
}

export const ShelfSelectionDialog: React.FC<ShelfSelectionDialogProps> = ({
  currentShelfId,
  open,
  onClose,
  onConfirmSelection,
  onCreateShelf
}) => {
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEnteringTitleMode, setIsEnteringTitleMode] = useState(false);
  const [newShelfTitle, setNewShelfTitle] = useState("");
  const [isSubmittingNewShelf, setIsSubmittingNewShelf] = useState(false);
  
  const {
    getEditableShelves,
    isLoggedIn,
    shelvesLoading
  } = useAddToShelf();

  useEffect(() => {
    if (open) {
      setIsLoading(shelvesLoading);
      setIsEnteringTitleMode(false);
      setNewShelfTitle("");
      setIsSubmittingNewShelf(false);
    }
  }, [open, shelvesLoading]);
  
  const handleDialogClose = useCallback(() => {
    if (isSubmittingNewShelf) return;
    setSelectedShelfId(null);
    setSearchTerm("");
    setIsEnteringTitleMode(false);
    setNewShelfTitle("");
    onClose();
  }, [onClose, isSubmittingNewShelf]);
  
  const handleShelfSelection = (shelfId: string) => {
    if (isEnteringTitleMode || isSubmittingNewShelf) return;
    setSelectedShelfId(shelfId === selectedShelfId ? null : shelfId);
  };
  
  const handleConfirmExistingShelf = async () => {
    if (!selectedShelfId || isEnteringTitleMode || isSubmittingNewShelf) return;

    onConfirmSelection(selectedShelfId);
    onClose();
  };

  const handleStartCreateNewShelf = () => {
    if (isLoading || isSubmittingNewShelf || !onCreateShelf) return;
    setIsEnteringTitleMode(true);
    setSelectedShelfId(null);
  };

  const handleCancelCreateNewShelf = () => {
    setIsEnteringTitleMode(false);
    setNewShelfTitle("");
  };

  const handleConfirmCreateShelf = useCallback(async () => {
    if (!newShelfTitle.trim() || !onCreateShelf || isSubmittingNewShelf || isLoading) return;

    setIsSubmittingNewShelf(true);
    try {
      const newShelfId = await onCreateShelf(newShelfTitle.trim(), ""); 

      if (newShelfId) {
          setSelectedShelfId(newShelfId); 
          toast.success(`'${newShelfTitle.trim()}' created. Click 'Add to Selected Shelf' to continue.`);
          setIsEnteringTitleMode(false);
          setNewShelfTitle("");
      } else {
          toast.error("Failed to create shelf. Please try again.");
      }
    } catch (error) {
      toast.error(`Shelf creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmittingNewShelf(false);
    }
  }, [onCreateShelf, isLoading, isSubmittingNewShelf, newShelfTitle]);

  const canShowContent = isLoggedIn;
  const editableShelves = canShowContent ? getEditableShelves(currentShelfId) : [];
  const filteredShelves = denormalizeShelves(
    editableShelves.filter((shelf: NormalizedShelf) => {
      if (!searchTerm) return true;
      const title = typeof shelf.title === 'string' ? shelf.title.toLowerCase() : '';
      const description = typeof shelf.description?.[0] === 'string' ? shelf.description[0].toLowerCase() : '';
      const search = searchTerm.toLowerCase();
      return title.includes(search) || description.includes(search);
    })
  );
  const availableShelves = useMemo(() => {
    return isEnteringTitleMode ? [] : filteredShelves;
  }, [filteredShelves, isEnteringTitleMode]);

  useEffect(() => {
    if (!open) {
      setIsSubmittingNewShelf(false);
      setIsEnteringTitleMode(false);
      setNewShelfTitle("");
    }
  }, [open]);

  const descriptionId = "shelf-selection-dialog-description";
  const disableInteractions = isEnteringTitleMode || isSubmittingNewShelf;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) handleDialogClose(); }}>
      <DialogContent 
        className="sm:max-w-md font-serif" 
        onClick={(e) => e.stopPropagation()}
        aria-describedby={descriptionId}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 font-serif">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading shelves...</p>
          </div>
        ) : !isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-8 text-center font-serif">
            <DialogHeader>
              <DialogTitle>Login Required</DialogTitle>
            </DialogHeader>
            <p className="mt-2 text-sm text-muted-foreground">
              You need to be logged in to add content to shelves
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif">Add to Shelf</DialogTitle>
              <DialogDescription id={descriptionId}> 
                 {isEnteringTitleMode 
                   ? "Don't worry, you can change the later." 
                   : "Select an existing shelf or create a new one to add this item."}
              </DialogDescription>
            </DialogHeader>

            {!isEnteringTitleMode && (
              <Input
                type="text"
                placeholder="Search shelves..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="mb-4 font-sans"
                disabled={disableInteractions}
              />
            )}

            {isEnteringTitleMode && (
              <div className="space-y-2 mb-4">
                <Input
                  type="text"
                  placeholder="New shelf title"
                  value={newShelfTitle}
                  onChange={(e) => setNewShelfTitle(e.target.value)}
                  className="font-sans"
                  disabled={isSubmittingNewShelf}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={handleCancelCreateNewShelf}
                    disabled={isSubmittingNewShelf}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmCreateShelf}
                    disabled={!newShelfTitle.trim() || isSubmittingNewShelf}
                  >
                    {isSubmittingNewShelf ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Shelf"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {!isEnteringTitleMode && availableShelves.length > 0 ? (
              <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 mb-4 custom-scrollbar">
                {availableShelves.map((shelf) => (
                  <Button
                    key={shelf.shelf_id}
                    variant={selectedShelfId === shelf.shelf_id ? "primary" : "outline"}
                    className="w-full justify-start font-serif"
                    onClick={() => handleShelfSelection(shelf.shelf_id)}
                    disabled={disableInteractions}
                  >
                    {shelf.title || "un-named shelf"}
                  </Button>
                ))}
              </div>
            ) : !isEnteringTitleMode && (
              <div className="text-center py-4 text-muted-foreground font-serif">
                {searchTerm ? "No shelves match your search." : "You have no editable shelves yet."}
              </div>
            )}

            {!isEnteringTitleMode && (
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <Button
                    variant="secondary"
                    onClick={handleStartCreateNewShelf}
                    disabled={isLoading || disableInteractions || !onCreateShelf}
                    className="w-full sm:w-auto"
                >
                    Create New Shelf
                </Button>
                 <Button
                   onClick={handleConfirmExistingShelf}
                   disabled={!selectedShelfId || disableInteractions}
                   className="w-full sm:w-auto"
                 >
                     Add to Selected Shelf
                 </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 