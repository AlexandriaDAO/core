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
import { AlertCircle } from 'lucide-react'; // Import AlertCircle for warning
import { Label } from "@/lib/components/label"; // Import Label

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
  onConfirmSelection: (selectedShelfIds: string[]) => void;
  onCreateShelf: (title: string, description: string) => Promise<string | null | undefined>;
}

const MAX_SELECTIONS = 3; // Define the selection limit
const MAX_TITLE_LENGTH = 100; // Define title length limit

export const ShelfSelectionDialog: React.FC<ShelfSelectionDialogProps> = ({
  currentShelfId,
  open,
  onClose,
  onConfirmSelection,
  onCreateShelf
}) => {
  const [selectedShelfIds, setSelectedShelfIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEnteringTitleMode, setIsEnteringTitleMode] = useState(false);
  const [newShelfTitle, setNewShelfTitle] = useState("");
  const [isSubmittingNewShelf, setIsSubmittingNewShelf] = useState(false);
  const [justCreatedShelfId, setJustCreatedShelfId] = useState<string | null>(null);
  
  const {
    getEditableShelves,
    isLoggedIn,
    shelvesLoading
  } = useAddToShelf();

  const editableShelves = useMemo(() => {
    if (!isLoggedIn) return [];
    return denormalizeShelves(getEditableShelves(currentShelfId));
  }, [isLoggedIn, getEditableShelves, currentShelfId]);

  useEffect(() => {
    if (open) {
      setIsLoading(shelvesLoading);
      setIsEnteringTitleMode(false);
      setNewShelfTitle("");
      setIsSubmittingNewShelf(false);
      setJustCreatedShelfId(null);
      setSelectedShelfIds([]);
    }
  }, [open, shelvesLoading]);
  
  const handleDialogClose = useCallback(() => {
    if (isSubmittingNewShelf) return;
    setSelectedShelfIds([]);
    setSearchTerm("");
    setIsEnteringTitleMode(false);
    setNewShelfTitle("");
    setJustCreatedShelfId(null);
    onClose();
  }, [onClose, isSubmittingNewShelf]);
  
  const handleShelfSelection = (shelfId: string) => {
    if (isEnteringTitleMode || isSubmittingNewShelf) return;
    
    setSelectedShelfIds(prevSelected => {
      if (prevSelected.includes(shelfId)) {
        return prevSelected.filter(id => id !== shelfId);
      } else if (prevSelected.length < MAX_SELECTIONS) {
        return [...prevSelected, shelfId];
      } else {
        toast.warning(`You can select up to ${MAX_SELECTIONS} shelves.`);
        return prevSelected;
      }
    });
    if (justCreatedShelfId && shelfId !== justCreatedShelfId) {
        setJustCreatedShelfId(null);
    }
  };
  
  const handleConfirmSelection = async () => {
    if (selectedShelfIds.length === 0 || isEnteringTitleMode || isSubmittingNewShelf) return;

    onConfirmSelection(selectedShelfIds);
    handleDialogClose();
  };

  const handleStartCreateNewShelf = () => {
    if (isLoading || isSubmittingNewShelf || !onCreateShelf) return;
    setIsEnteringTitleMode(true);
    setSelectedShelfIds([]);
    setJustCreatedShelfId(null);
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
          setSelectedShelfIds([newShelfId]); 
          setJustCreatedShelfId(newShelfId);
          toast.success(`'${newShelfTitle.trim()}' created. Click 'Add to Selected Shelf' to use it.`);
          setIsEnteringTitleMode(false);
          setNewShelfTitle("");
          setSearchTerm("");
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
  const filteredShelves = useMemo(() => 
      editableShelves.filter((shelf: ShelfPublic) => {
          if (!searchTerm) return true;
          const title = typeof shelf.title === 'string' ? shelf.title.toLowerCase() : '';
          const description = typeof shelf.description?.[0] === 'string' ? shelf.description[0].toLowerCase() : '';
          const search = searchTerm.toLowerCase();
          return title.includes(search) || description.includes(search);
      }), [editableShelves, searchTerm]);
      
  const availableShelves = useMemo(() => {
    return isEnteringTitleMode ? [] : filteredShelves;
  }, [filteredShelves, isEnteringTitleMode]);

  useEffect(() => {
    if (!open) {
      setIsSubmittingNewShelf(false);
      setIsEnteringTitleMode(false);
      setNewShelfTitle("");
      setJustCreatedShelfId(null);
    }
  }, [open]);

  const descriptionId = "shelf-selection-dialog-description";
  const disableInteractions = isEnteringTitleMode || isSubmittingNewShelf;
  const reachedSelectionLimit = selectedShelfIds.length >= MAX_SELECTIONS;
  const newTitleLength = newShelfTitle.length; // Calculate title length

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
                   ? "Enter a title for your new shelf. You can add a description later." 
                   : `Select up to ${MAX_SELECTIONS} existing shelves or create a new one.`}
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
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="new-shelf-title" className="sr-only">New Shelf Title</Label> {/* Added sr-only Label for accessibility */}
                     <span className={`text-xs ${newTitleLength > MAX_TITLE_LENGTH ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {newTitleLength}/{MAX_TITLE_LENGTH}
                     </span>
                  </div>
                  <Input
                    id="new-shelf-title" // Added id for label association
                    type="text"
                    placeholder="Ideas worth sharing..."
                    value={newShelfTitle}
                    onChange={(e) => setNewShelfTitle(e.target.value)}
                    className="font-sans"
                    disabled={isSubmittingNewShelf}
                    maxLength={MAX_TITLE_LENGTH} // Enforce max length
                    autoFocus
                  />
                </div>
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
                    disabled={!newShelfTitle.trim() || isSubmittingNewShelf || newTitleLength > MAX_TITLE_LENGTH} // Disable if title empty, submitting, or too long
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
                {availableShelves.map((shelf) => {
                  const isSelected = selectedShelfIds.includes(shelf.shelf_id);
                  const isDisabled = disableInteractions || (reachedSelectionLimit && !isSelected);
                  return (
                      <Button
                        key={shelf.shelf_id}
                        variant={isSelected ? "primary" : "outline"}
                        className="w-full justify-start font-serif"
                        onClick={() => handleShelfSelection(shelf.shelf_id)}
                        disabled={isDisabled}
                        aria-pressed={isSelected}
                      >
                        {shelf.title || "un-named shelf"}
                      </Button>
                  );
                })}
                 {reachedSelectionLimit && (
                    <div className="text-xs text-orange-600 flex items-center gap-1 p-1 rounded-sm bg-orange-50 border border-orange-200">
                         <AlertCircle size={14} /> Maximum {MAX_SELECTIONS} shelves selected.
                    </div>
                 )}
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
                   onClick={handleConfirmSelection}
                   disabled={selectedShelfIds.length === 0 || disableInteractions}
                   className="w-full sm:w-auto"
                 >
                     Add to {selectedShelfIds.length > 1 ? `${selectedShelfIds.length} Shelves` : selectedShelfIds.length === 1 ? 'Selected Shelf' : 'Shelf'}
                 </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 