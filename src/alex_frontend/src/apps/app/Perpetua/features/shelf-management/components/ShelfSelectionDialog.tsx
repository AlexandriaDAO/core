import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// Restore original dialog imports
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/lib/components/dialog";
import { Loader2, Search, Tag as TagIcon, ArrowLeft } from "lucide-react";
import { useAddToShelf } from "../hooks/useAddToShelf";
import { NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { Principal } from "@dfinity/principal";
import { ShelfPublic, Item as PerpetuaItem } from "@/../../declarations/perpetua/perpetua.did";
import { toast } from 'sonner';
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { AlertCircle } from 'lucide-react'; // Import AlertCircle for warning
import { Label } from "@/lib/components/label"; // Import Label
import { useTagActions } from "@/apps/app/Perpetua/features/tags/hooks/useTagActions";
import { useTagData } from "@/apps/app/Perpetua/features/tags/hooks/useTagData";
import debounce from 'lodash/debounce'; // For debouncing tag search
import { cn } from "@/lib/utils"; // For conditional classes

/**
 * Convert a NormalizedShelf back to a Shelf for API calls and components
 */
const denormalizeShelf = (normalizedShelf: NormalizedShelf): ShelfPublic => {
  // Assuming NormalizedShelf has a structure that needs mapping to ShelfPublic
  // Particularly for fields like `items` and `item_positions` which are BTreeMaps in Candid
  const itemsArray: Array<[number, PerpetuaItem]> = normalizedShelf.items
    ? Object.entries(normalizedShelf.items).map(([key, value]) => [Number(key), value as unknown as PerpetuaItem])
    : [];
  const itemPositionsArray: Array<[number, number]> = normalizedShelf.item_positions
    ? normalizedShelf.item_positions.map(pos => [pos[0], pos[1]])
    : [];

  return {
    shelf_id: normalizedShelf.shelf_id,
    title: normalizedShelf.title,
    description: normalizedShelf.description || [], // Ensure it's an array
    owner: Principal.fromText(normalizedShelf.owner),
    items: itemsArray,
    item_positions: itemPositionsArray,
    created_at: BigInt(normalizedShelf.created_at),
    updated_at: BigInt(normalizedShelf.updated_at),
    appears_in: normalizedShelf.appears_in || [],
    tags: normalizedShelf.tags || [],
    public_editing: normalizedShelf.public_editing,
  };
};

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
const TAG_SEARCH_DEBOUNCE_DELAY = 300;

type SearchMode = "myShelves" | "publicTagSearch" | "publicShelfView";

export const ShelfSelectionDialog: React.FC<ShelfSelectionDialogProps> = ({
  currentShelfId,
  open,
  onClose,
  onConfirmSelection,
  onCreateShelf
}) => {
  const [selectedShelfIds, setSelectedShelfIds] = useState<string[]>([]);
  const [myShelvesSearchTerm, setMyShelvesSearchTerm] = useState(""); // Renamed from searchTerm
  const [isLoading, setIsLoading] = useState(true); // For initial own shelves loading
  const [isEnteringTitleMode, setIsEnteringTitleMode] = useState(false);
  const [newShelfTitle, setNewShelfTitle] = useState("");
  const [isSubmittingNewShelf, setIsSubmittingNewShelf] = useState(false);
  const [justCreatedShelfId, setJustCreatedShelfId] = useState<string | null>(null);
  
  // --- States for Public Shelf Discovery ---
  const [searchMode, setSearchMode] = useState<SearchMode>("myShelves");
  const [publicTagSearchTerm, setPublicTagSearchTerm] = useState("");
  const [selectedPublicTag, setSelectedPublicTag] = useState<string | null>(null);
  const [fetchedPublicShelves, setFetchedPublicShelves] = useState<ShelfPublic[]>([]);
  const [publicShelfTitleFilter, setPublicShelfTitleFilter] = useState("");
  const [isLoadingPublicShelves, setIsLoadingPublicShelves] = useState(false);
  const tagSearchContainerRef = useRef<HTMLDivElement>(null);
  const [isTagSearchFocused, setIsTagSearchFocused] = useState(false);

  const {
    getEditableShelves,
    isLoggedIn,
    shelvesLoading,
    fetchPublicShelvesByTag,
  } = useAddToShelf();

  const { fetchTagsWithPrefix } = useTagActions();
  const { tagSearchResults, isTagSearchLoading } = useTagData();

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
      // Reset public search states
      setSearchMode("myShelves");
      setPublicTagSearchTerm("");
      setSelectedPublicTag(null);
      setFetchedPublicShelves([]);
      setPublicShelfTitleFilter("");
      setIsTagSearchFocused(false);
    }
  }, [open, shelvesLoading]);
  
  const handleDialogClose = useCallback(() => {
    if (isSubmittingNewShelf) return;
    setSelectedShelfIds([]);
    setMyShelvesSearchTerm("");
    setIsEnteringTitleMode(false);
    setNewShelfTitle("");
    setJustCreatedShelfId(null);
    // Reset public search states on close
    setSearchMode("myShelves");
    setPublicTagSearchTerm("");
    setSelectedPublicTag(null);
    setFetchedPublicShelves([]);
    setPublicShelfTitleFilter("");
    setIsTagSearchFocused(false);
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
    setSelectedShelfIds([]); // Clear selections when starting to create new
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
          setMyShelvesSearchTerm(""); // Clear search term for my shelves
      } else {
          toast.error("Failed to create shelf. Please try again.");
      }
    } catch (error) {
      toast.error(`Shelf creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmittingNewShelf(false);
    }
  }, [onCreateShelf, isLoading, isSubmittingNewShelf, newShelfTitle]);

  // --- Public Tag Search Logic ---
  const debouncedFetchTags = useCallback(
    debounce((prefix: string) => {
        if (prefix.trim()) {
            fetchTagsWithPrefix(prefix, { limit: 10 }); // Fetch 10 tags
        }
    }, TAG_SEARCH_DEBOUNCE_DELAY),
    [fetchTagsWithPrefix]
  );

  useEffect(() => {
    if (searchMode === "publicTagSearch") {
        debouncedFetchTags(publicTagSearchTerm);
    }
    return () => {
        debouncedFetchTags.cancel();
    };
  }, [publicTagSearchTerm, searchMode, debouncedFetchTags]);

  // Close tag dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (tagSearchContainerRef.current && !tagSearchContainerRef.current.contains(event.target as Node)) {
            setIsTagSearchFocused(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePublicTagSelect = async (tag: string) => {
    setSelectedPublicTag(tag);
    setPublicTagSearchTerm(""); // Clear tag search input
    setIsTagSearchFocused(false); // Hide dropdown
    setSearchMode("publicShelfView");
    setFetchedPublicShelves([]); // Clear previous shelves
    setPublicShelfTitleFilter(""); // Clear title filter

    try {
      setIsLoadingPublicShelves(true); // Set loading true before the call
      const shelves = await fetchPublicShelvesByTag(tag); // Use the real function from the hook
      setFetchedPublicShelves(shelves);
    } catch (err) {
      toast.error("Failed to fetch public shelves for this tag.");
      console.error("Error fetching public shelves:", err);
      setFetchedPublicShelves([]); // Clear shelves on error
    } finally {
      setIsLoadingPublicShelves(false); // Set loading false after the call/error
    }
  };
  
  const handleBackToTagSearch = () => {
    setSearchMode("publicTagSearch");
    setSelectedPublicTag(null);
    setFetchedPublicShelves([]);
    setPublicShelfTitleFilter("");
    setPublicTagSearchTerm(""); // Clear tag search term
  };

  // --- Filtering Logic ---
  const filteredMyShelves = useMemo(() => 
      editableShelves.filter((shelf: ShelfPublic) => {
          if (!myShelvesSearchTerm) return true;
          const title = typeof shelf.title === 'string' ? shelf.title.toLowerCase() : '';
          const description = Array.isArray(shelf.description) && typeof shelf.description[0] === 'string' ? shelf.description[0].toLowerCase() : '';
          const search = myShelvesSearchTerm.toLowerCase();
          return title.includes(search) || description.includes(search);
      }), [editableShelves, myShelvesSearchTerm]);
  
  const filteredPublicShelves = useMemo(() => {
    if (searchMode !== 'publicShelfView') return [];
    return fetchedPublicShelves.filter((shelf: ShelfPublic) => {
      if (!publicShelfTitleFilter) return true;
      const title = typeof shelf.title === 'string' ? shelf.title.toLowerCase() : '';
      const search = publicShelfTitleFilter.toLowerCase();
      return title.includes(search);
    });
  }, [fetchedPublicShelves, publicShelfTitleFilter, searchMode]);

  const canShowContent = isLoggedIn;
  const descriptionId = "shelf-selection-dialog-description";
  const disableInteractions = isEnteringTitleMode || isSubmittingNewShelf || isLoadingPublicShelves;
  const reachedSelectionLimit = selectedShelfIds.length >= MAX_SELECTIONS;
  const newTitleLength = newShelfTitle.length; 

  const showTagSearchDropdown = isTagSearchFocused && searchMode === 'publicTagSearch' && publicTagSearchTerm.trim().length > 0;

  // Determine what list of shelves to display
  const shelvesToDisplay = searchMode === 'myShelves' 
    ? filteredMyShelves 
    : searchMode === 'publicShelfView' 
    ? filteredPublicShelves 
    : [];

  const currentSearchTermForEmptyMessage = searchMode === 'myShelves' 
    ? myShelvesSearchTerm 
    : searchMode === 'publicShelfView'
    ? publicShelfTitleFilter
    : publicTagSearchTerm;
  
  const emptyListMessage = () => {
    if (searchMode === 'myShelves') {
        return myShelvesSearchTerm ? "No shelves match your search." : "You have no editable shelves yet.";
    }
    if (searchMode === 'publicTagSearch') {
        return publicTagSearchTerm && !isTagSearchLoading && tagSearchResults.length === 0 
                ? "No tags match your search." 
                : "Search for tags to discover public shelves.";
    }
    if (searchMode === 'publicShelfView') {
        return publicShelfTitleFilter 
            ? "No public shelves match your title filter." 
            : (fetchedPublicShelves.length === 0 && !isLoadingPublicShelves 
                ? `No public shelves found for tag "${selectedPublicTag || ''}"` 
                : "Filter shelves by title or select one.");
    }
    return "No shelves available.";
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) handleDialogClose(); }}>
      <DialogContent 
        className="sm:max-w-md font-serif" 
        onClick={(e) => e.stopPropagation()}
        aria-describedby={descriptionId}
      >
        {isLoading ? ( // This is for initial loading of user's own shelves
          <div className="flex flex-col items-center justify-center py-8 font-serif">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading shelves...</p>
          </div>
        ) : !isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-8 text-center font-serif">
            <DialogHeader><DialogTitle>Login Required</DialogTitle></DialogHeader>
            <p className="mt-2 text-sm text-muted-foreground">You need to be logged in to add content to shelves</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif">Add to Shelf</DialogTitle>
              <DialogDescription id={descriptionId}> 
                 {isEnteringTitleMode 
                   ? "Enter a title for your new shelf. You can add a description later." 
                   : searchMode === 'publicTagSearch'
                   ? "Search for public shelves by tag."
                   : searchMode === 'publicShelfView'
                   ? `Public shelves for tag: "${selectedPublicTag || ''}" Select or filter by title.`
                   : `Select up to ${MAX_SELECTIONS} existing shelves or create a new one.`}
              </DialogDescription>
            </DialogHeader>

            {/* Mode Toggle Buttons */}
            {!isEnteringTitleMode && (
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={searchMode === 'myShelves' ? 'primary' : 'outline'} 
                  onClick={() => setSearchMode('myShelves')}
                  className="flex-1"
                  disabled={disableInteractions}
                >
                  My Shelves
                </Button>
                <Button 
                  variant={searchMode === 'publicTagSearch' || searchMode === 'publicShelfView' ? 'primary' : 'outline'} 
                  onClick={() => { setSearchMode('publicTagSearch'); setSelectedPublicTag(null); setFetchedPublicShelves([]); setPublicShelfTitleFilter('');}}
                  className="flex-1"
                  disabled={disableInteractions}
                >
                  Discover Public
                </Button>
              </div>
            )}
            
            {/* Search Inputs & Back Button */}
            {!isEnteringTitleMode && searchMode === 'myShelves' && (
              <Input
                type="text"
                placeholder="Search your shelves..."
                value={myShelvesSearchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMyShelvesSearchTerm(e.target.value)}
                className="mb-4 font-sans"
                disabled={disableInteractions}
              />
            )}

            {!isEnteringTitleMode && searchMode === 'publicTagSearch' && (
              <div className="relative mb-4" ref={tagSearchContainerRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search tags (e.g., science, art)"
                        value={publicTagSearchTerm}
                        onChange={(e) => setPublicTagSearchTerm(e.target.value)}
                        onFocus={() => setIsTagSearchFocused(true)}
                        className="pl-9 pr-8 w-full font-sans"
                        disabled={disableInteractions}
                        autoFocus
                    />
                    {isTagSearchLoading && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                    )}
                  </div>
                  {showTagSearchDropdown && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                          <ul className="py-1">
                              {tagSearchResults.length > 0 ? (
                                  tagSearchResults.map((tag: string) => (
                                      <li
                                          key={tag}
                                          className={cn(
                                              "px-3 py-2 text-sm rounded-sm flex items-center gap-2",
                                              "text-foreground hover:bg-accent hover:text-accent-foreground",
                                              "cursor-pointer transition-colors"
                                          )}
                                          onClick={() => handlePublicTagSelect(tag)}
                                      >
                                          <TagIcon className="h-3.5 w-3.5 text-primary" />
                                          <span>{tag}</span>
                                      </li>
                                  ))
                              ) : !isTagSearchLoading ? (
                                  <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                                      No matching tags found.
                                  </li>
                              ) : null}
                          </ul>
                      </div>
                  )}
              </div>
            )}

            {!isEnteringTitleMode && searchMode === 'publicShelfView' && (
              <div className="mb-4 space-y-2">
                <Button variant="ghost" onClick={handleBackToTagSearch} className="text-sm px-2 py-1 h-auto" disabled={disableInteractions}>
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to Tag Search
                </Button>
                <Input
                    type="text"
                    placeholder="Filter public shelves by title..."
                    value={publicShelfTitleFilter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublicShelfTitleFilter(e.target.value)}
                    className="font-sans"
                    disabled={disableInteractions}
                    autoFocus
                />
              </div>
            )}

            {/* New Shelf Title Input Area */}
            {isEnteringTitleMode && (
              <div className="space-y-2 mb-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="new-shelf-title" className="sr-only">New Shelf Title</Label>
                     <span className={`text-xs ${newTitleLength > MAX_TITLE_LENGTH ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {newTitleLength}/{MAX_TITLE_LENGTH}
                     </span>
                  </div>
                  <Input
                    id="new-shelf-title" 
                    type="text"
                    placeholder="Ideas worth sharing..."
                    value={newShelfTitle}
                    onChange={(e) => setNewShelfTitle(e.target.value)}
                    className="font-sans"
                    disabled={isSubmittingNewShelf}
                    maxLength={MAX_TITLE_LENGTH} 
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={handleCancelCreateNewShelf} disabled={isSubmittingNewShelf}>Cancel</Button>
                  <Button onClick={handleConfirmCreateShelf} disabled={!newShelfTitle.trim() || isSubmittingNewShelf || newTitleLength > MAX_TITLE_LENGTH}>
                    {isSubmittingNewShelf ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ("Save Shelf")}
                  </Button>
                </div>
              </div>
            )}

            {/* Shelf List Display Area */}
            {!isEnteringTitleMode && (searchMode === 'myShelves' || searchMode === 'publicShelfView') ? (
              isLoadingPublicShelves ? (
                <div className="flex flex-col items-center justify-center py-8 font-serif">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading public shelves...</p>
                </div>
              ) : shelvesToDisplay.length > 0 ? (
                <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 mb-4 custom-scrollbar">
                  {shelvesToDisplay.map((shelf: ShelfPublic) => {
                    const isSelected = selectedShelfIds.includes(shelf.shelf_id);
                    // Disable if interactions are globally disabled OR (selection limit is reached AND this item is not already selected)
                    const itemInteractionDisabled = disableInteractions || (reachedSelectionLimit && !isSelected);
                    return (
                        <Button
                          key={shelf.shelf_id}
                          variant={isSelected ? "primary" : "outline"}
                          className="w-full justify-start font-serif"
                          onClick={() => handleShelfSelection(shelf.shelf_id)}
                          disabled={itemInteractionDisabled}
                          aria-pressed={isSelected}
                        >
                          {shelf.title || "un-named shelf"}
                          {searchMode === 'publicShelfView' && shelf.owner && (
                            <span className="ml-2 text-xs text-muted-foreground truncate">by {shelf.owner.toText().substring(0, 5)}...</span>
                          )}
                        </Button>
                    );
                  })}
                   {reachedSelectionLimit && (
                      <div className="text-xs text-orange-600 flex items-center gap-1 p-1 rounded-sm bg-orange-50 border border-orange-200">
                           <AlertCircle size={14} /> Maximum {MAX_SELECTIONS} shelves selected.
                      </div>
                   )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground font-serif">
                  {emptyListMessage()}
                </div>
              )
            ) : !isEnteringTitleMode && searchMode === 'publicTagSearch' && !isTagSearchLoading && tagSearchResults.length === 0 && publicTagSearchTerm && (
                 <div className="text-center py-4 text-muted-foreground font-serif">
                  {emptyListMessage()}
                </div>
            )}
            
            {/* Footer Buttons */}
            {!isEnteringTitleMode && (
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                {searchMode === 'myShelves' ? ( // Show "Create New Shelf" only in "My Shelves" mode
                    <Button
                        variant="secondary"
                        onClick={handleStartCreateNewShelf}
                        disabled={isLoading || disableInteractions || !onCreateShelf}
                        className="w-full sm:w-auto"
                    >
                        Create New Shelf
                    </Button>
                ) : (<div className="w-full sm:w-auto"></div>) /* Placeholder to keep alignment */}
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