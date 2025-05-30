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
import { ShelfPublic, Item as PerpetuaItem, QueryError } from "@/../../declarations/perpetua/perpetua.did";
import { toast } from 'sonner';
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { AlertCircle } from 'lucide-react'; // Import AlertCircle for warning
import { Label } from "@/lib/components/label"; // Import Label
import { useTagActions } from "@/apps/app/Perpetua/features/tags/hooks/useTagActions";
import { useTagData } from "@/apps/app/Perpetua/features/tags/hooks/useTagData";
import debounce from 'lodash/debounce'; // For debouncing tag search
import { cn } from "@/lib/utils"; // For conditional classes
import PrincipalSelector from "@/apps/Modules/LibModules/nftSearch/PrincipalSelector"; // Added import
import { getUserShelves, getUserPubliclyEditableShelves } from "@/apps/app/Perpetua/state/services/shelfService"; // Updated import
import { OffsetPaginationParams, OffsetPaginatedResponse } from "@/apps/app/Perpetua/state/services/serviceTypes"; // Corrected import path
import { Result } from "@/apps/app/Perpetua/utils"; // Corrected import path
import { usePerpetua } from "@/hooks/actors";
import { AlexBackendActor } from "@/actors";

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

type SearchMode = "myShelves" | "publicDiscovery";
type PublicDiscoverActiveSection = "user" | "tag";

export const ShelfSelectionDialog: React.FC<ShelfSelectionDialogProps> = ({
  currentShelfId,
  open,
  onClose,
  onConfirmSelection,
  onCreateShelf
}) => {
  const {actor} = usePerpetua();
  const [selectedShelfIds, setSelectedShelfIds] = useState<string[]>([]);
  const [myShelvesSearchTerm, setMyShelvesSearchTerm] = useState(""); // Renamed from searchTerm
  const [isLoading, setIsLoading] = useState(true); // For initial own shelves loading
  const [isEnteringTitleMode, setIsEnteringTitleMode] = useState(false);
  const [newShelfTitle, setNewShelfTitle] = useState("");
  const [isSubmittingNewShelf, setIsSubmittingNewShelf] = useState(false);
  const [justCreatedShelfId, setJustCreatedShelfId] = useState<string | null>(null);
  
  // --- States for Public Shelf Discovery ---
  const [searchMode, setSearchMode] = useState<SearchMode>("myShelves");
  const [publicDiscoverActiveSection, setPublicDiscoverActiveSection] = useState<PublicDiscoverActiveSection>("tag");
  
  // Tag search states
  const [publicTagSearchTerm, setPublicTagSearchTerm] = useState("");
  const [selectedPublicTag, setSelectedPublicTag] = useState<string | null>(null);
  const [fetchedPublicShelves, setFetchedPublicShelves] = useState<ShelfPublic[]>([]); // Shelves found by tag
  const [publicShelfTitleFilter, setPublicShelfTitleFilter] = useState(""); // Filter for shelves found by tag
  const [isLoadingPublicShelves, setIsLoadingPublicShelves] = useState(false); // Loading for shelves by tag

  // User search states
  const [selectedPublicUserPrincipal, setSelectedPublicUserPrincipal] = useState<string | null>(null);
  const [fetchedUserPublicShelves, setFetchedUserPublicShelves] = useState<ShelfPublic[]>([]); // Shelves found by user search
  const [isLoadingUserPublicShelves, setIsLoadingUserPublicShelves] = useState(false); // Loading for user's public shelves
  const [userPublicShelfTitleFilter, setUserPublicShelfTitleFilter] = useState(""); // Filter for user's public shelves
  
  const tagSearchContainerRef = useRef<HTMLDivElement>(null);
  const [isTagSearchFocused, setIsTagSearchFocused] = useState(false);
  const backToUserSearchButtonRef = useRef<HTMLButtonElement>(null); // Added ref

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
    }
  }, [open, shelvesLoading]);

  useEffect(() => {
    if (open) {
      setIsEnteringTitleMode(false);
      setNewShelfTitle("");
      setIsSubmittingNewShelf(false);
      setJustCreatedShelfId(null);
      setSelectedShelfIds([]);
      setSearchMode("myShelves");
      setPublicDiscoverActiveSection("tag");
      setPublicTagSearchTerm("");
      setSelectedPublicTag(null);
      setFetchedPublicShelves([]);
      setPublicShelfTitleFilter("");
      setIsLoadingPublicShelves(false);
      setSelectedPublicUserPrincipal(null);
      setFetchedUserPublicShelves([]);
      setIsLoadingUserPublicShelves(false);
      setUserPublicShelfTitleFilter("");
      setIsTagSearchFocused(false);
    }
  }, [open]);
  
  const handleDialogClose = useCallback(() => {
    if (isSubmittingNewShelf) return;
    setSelectedShelfIds([]);
    setMyShelvesSearchTerm("");
    setIsEnteringTitleMode(false);
    setNewShelfTitle("");
    setJustCreatedShelfId(null);
    setSearchMode("myShelves");
    setPublicDiscoverActiveSection("tag");
    setPublicTagSearchTerm("");
    setSelectedPublicTag(null);
    setFetchedPublicShelves([]);
    setPublicShelfTitleFilter("");
    setIsLoadingPublicShelves(false);
    setSelectedPublicUserPrincipal(null);
    setFetchedUserPublicShelves([]);
    setIsLoadingUserPublicShelves(false);
    setUserPublicShelfTitleFilter("");
    setIsTagSearchFocused(false);
    onClose();
  }, [onClose, isSubmittingNewShelf]);
  
  const handleShelfSelection = useCallback((shelfId: string) => {
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
  }, [isEnteringTitleMode, isSubmittingNewShelf, justCreatedShelfId]);
  
  const handleConfirmSelection = useCallback(async () => {
    if (selectedShelfIds.length === 0 || isEnteringTitleMode || isSubmittingNewShelf) return;
    onConfirmSelection(selectedShelfIds);
    handleDialogClose();
  }, [selectedShelfIds, isEnteringTitleMode, isSubmittingNewShelf, onConfirmSelection, handleDialogClose]);

  const handleStartCreateNewShelf = useCallback(() => {
    if (isLoading || isSubmittingNewShelf || !onCreateShelf) return;
    setIsEnteringTitleMode(true);
    setSelectedShelfIds([]); 
    setJustCreatedShelfId(null);
  }, [isLoading, isSubmittingNewShelf, onCreateShelf]);

  const handleCancelCreateNewShelf = useCallback(() => {
    setIsEnteringTitleMode(false);
    setNewShelfTitle("");
  }, []);

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
          setMyShelvesSearchTerm("");
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
            fetchTagsWithPrefix(prefix, { limit: 10 });
        }
    }, TAG_SEARCH_DEBOUNCE_DELAY),
    [fetchTagsWithPrefix]
  );

  useEffect(() => {
    if (searchMode === "publicDiscovery" && publicDiscoverActiveSection === "tag") {
        debouncedFetchTags(publicTagSearchTerm);
    }
    return () => {
        debouncedFetchTags.cancel();
    };
  }, [publicTagSearchTerm, searchMode, publicDiscoverActiveSection, debouncedFetchTags]);

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

  const handlePublicTagSelect = useCallback(async (tag: string) => {
    setSelectedPublicTag(tag);
    setPublicTagSearchTerm("");
    setIsTagSearchFocused(false);
    setFetchedPublicShelves([]);
    setPublicShelfTitleFilter("");

    try {
      setIsLoadingPublicShelves(true);
      const shelves = await fetchPublicShelvesByTag(tag);
      setFetchedPublicShelves(shelves);
    } catch (err) {
      toast.error("Failed to fetch public shelves for this tag.");
      console.error("Error fetching public shelves:", err);
      setFetchedPublicShelves([]);
    } finally {
      setIsLoadingPublicShelves(false);
    }
  }, [fetchPublicShelvesByTag]);
  
  const handleBackToTagSearch = useCallback(() => {
    setSelectedPublicTag(null);
    setFetchedPublicShelves([]);
    setPublicShelfTitleFilter("");
    setPublicTagSearchTerm("");
  }, []);

  // --- Public User Search Logic ---
  const fetchAndSetUserPublicShelves = useCallback(async (principalId: string) => {
    if(!actor) throw new Error("Perpetua Actor unavailable");
    if (!principalId || principalId === 'new') { 
      setFetchedUserPublicShelves([]);
      setSelectedPublicUserPrincipal(null); 
      return;
    }
    setIsLoadingUserPublicShelves(true);
    setFetchedUserPublicShelves([]); 

    const params: OffsetPaginationParams = { offset: 0, limit: 100 }; 

    try {
      const resultFromService: Result<OffsetPaginatedResponse<ShelfPublic>, QueryError> = 
        await getUserPubliclyEditableShelves(actor,Principal.fromText(principalId), params);

      if ("Ok" in resultFromService) {
        const paginatedResult = resultFromService.Ok;
        const shelvesWithPrincipalOwner = paginatedResult.items.map(shelf => ({
          ...shelf,
          owner: Principal.fromText(shelf.owner.toText()) 
        }));
        setFetchedUserPublicShelves(shelvesWithPrincipalOwner); 
        
        if (shelvesWithPrincipalOwner.length === 0) {
            toast.info("This user has no publicly editable shelves.");
        }
      } else {
        toast.error(`Failed to fetch shelves for user: ${resultFromService.Err}`);
        setFetchedUserPublicShelves([]);
      }
    } catch (error) {
      console.error("Error fetching user public shelves:", error);
      toast.error("An error occurred while fetching user shelves.");
      setFetchedUserPublicShelves([]);
    } finally {
      setIsLoadingUserPublicShelves(false);
    }
  }, []);
  
  const handleUserPrincipalSelect = useCallback((principalId: string | null) => {
    if (principalId && principalId !== 'new') {
      setSelectedPublicUserPrincipal(principalId);
      setUserPublicShelfTitleFilter(""); 
      fetchAndSetUserPublicShelves(principalId);
    } else {
      if (selectedPublicUserPrincipal === null && (principalId === null || principalId === 'new')) {
        return;
      }
      setSelectedPublicUserPrincipal(null);
      setFetchedUserPublicShelves([]);
      setUserPublicShelfTitleFilter("");
    }
  }, [fetchAndSetUserPublicShelves, selectedPublicUserPrincipal]);

  // Effect to focus the "Back to User Search" button after a user is selected
  useEffect(() => {
    if (searchMode === "publicDiscovery" && publicDiscoverActiveSection === "user" && selectedPublicUserPrincipal && backToUserSearchButtonRef.current) {
      const timer = setTimeout(() => {
        backToUserSearchButtonRef.current?.focus({ preventScroll: true });
      }, 0); 
      return () => clearTimeout(timer);
    }
  }, [searchMode, publicDiscoverActiveSection, selectedPublicUserPrincipal]);

  const handleBackToUserSearch = useCallback(() => {
    setSelectedPublicUserPrincipal(null);
    setFetchedUserPublicShelves([]);
    setUserPublicShelfTitleFilter("");
  }, []);

  // --- Filtering Logic ---
  const filteredMyShelves = useMemo(() => 
      editableShelves.filter((shelf: ShelfPublic) => {
          if (!myShelvesSearchTerm) return true;
          const title = typeof shelf.title === 'string' ? shelf.title.toLowerCase() : '';
          const description = Array.isArray(shelf.description) && typeof shelf.description[0] === 'string' ? shelf.description[0].toLowerCase() : '';
          const search = myShelvesSearchTerm.toLowerCase();
          return title.includes(search) || description.includes(search);
      }), [editableShelves, myShelvesSearchTerm]);
  
  const filteredPublicShelvesByTag = useMemo(() => {
    if (searchMode !== 'publicDiscovery' || publicDiscoverActiveSection !== 'tag' || !selectedPublicTag) return [];
    return fetchedPublicShelves.filter((shelf: ShelfPublic) => {
      if (!publicShelfTitleFilter) return true;
      const title = typeof shelf.title === 'string' ? shelf.title.toLowerCase() : '';
      const search = publicShelfTitleFilter.toLowerCase();
      return title.includes(search);
    });
  }, [fetchedPublicShelves, publicShelfTitleFilter, searchMode, publicDiscoverActiveSection, selectedPublicTag]);

  const filteredPublicShelvesByUser = useMemo(() => {
    if (searchMode !== 'publicDiscovery' || publicDiscoverActiveSection !== 'user' || !selectedPublicUserPrincipal) return [];
    return fetchedUserPublicShelves.filter((shelf: ShelfPublic) => {
      if (!userPublicShelfTitleFilter) return true;
      const title = typeof shelf.title === 'string' ? shelf.title.toLowerCase() : '';
      const search = userPublicShelfTitleFilter.toLowerCase();
      return title.includes(search);
    });
  }, [fetchedUserPublicShelves, userPublicShelfTitleFilter, searchMode, publicDiscoverActiveSection, selectedPublicUserPrincipal]);

  const canShowContent = isLoggedIn;
  const descriptionId = "shelf-selection-dialog-description";
  const disableInteractions = isEnteringTitleMode || isSubmittingNewShelf || isLoadingPublicShelves || isLoadingUserPublicShelves;
  const reachedSelectionLimit = selectedShelfIds.length >= MAX_SELECTIONS;
  const newTitleLength = newShelfTitle.length; 

  const showTagSearchDropdown = isTagSearchFocused && searchMode === 'publicDiscovery' && publicDiscoverActiveSection === 'tag' && publicTagSearchTerm.trim().length > 0;

  const shelvesToDisplay = useMemo(() => {
    if (searchMode === 'myShelves') {
      return filteredMyShelves;
    }
    if (searchMode === 'publicDiscovery') {
      if (publicDiscoverActiveSection === 'tag' && selectedPublicTag) {
        return filteredPublicShelvesByTag;
      }
      if (publicDiscoverActiveSection === 'user' && selectedPublicUserPrincipal) {
        return filteredPublicShelvesByUser;
      }
    }
    return [];
  }, [
    searchMode,
    publicDiscoverActiveSection,
    selectedPublicTag,
    selectedPublicUserPrincipal,
    filteredMyShelves,
    filteredPublicShelvesByTag,
    filteredPublicShelvesByUser,
  ]);

  const isLoadingCurrentPublicList = 
    (searchMode === 'publicDiscovery' && publicDiscoverActiveSection === 'tag' && isLoadingPublicShelves) ||
    (searchMode === 'publicDiscovery' && publicDiscoverActiveSection === 'user' && isLoadingUserPublicShelves);

  const currentSearchTermForEmptyMessage = searchMode === 'myShelves' 
    ? myShelvesSearchTerm 
    : searchMode === 'publicDiscovery' && publicDiscoverActiveSection === 'tag' && selectedPublicTag
    ? publicShelfTitleFilter
    : searchMode === 'publicDiscovery' && publicDiscoverActiveSection === 'user' && selectedPublicUserPrincipal
    ? userPublicShelfTitleFilter
    : publicTagSearchTerm;
  
  const emptyListMessage = useCallback(() => {
    if (searchMode === 'myShelves') {
        return myShelvesSearchTerm ? "No shelves match your search." : "You have no editable shelves yet.";
    }
    if (searchMode === 'publicDiscovery') {
      if (publicDiscoverActiveSection === 'tag') {
        if (selectedPublicTag) {
          return publicShelfTitleFilter 
              ? "No public shelves match your title filter for this tag." 
              : (fetchedPublicShelves.length === 0 && !isLoadingPublicShelves 
                  ? `No public shelves found for tag "${selectedPublicTag}"` 
                  : "Filter shelves by title or select one.");
        } else { 
        return publicTagSearchTerm && !isTagSearchLoading && tagSearchResults.length === 0 
                ? "No tags match your search." 
                : "Search for tags to discover public shelves.";
    }
      } else if (publicDiscoverActiveSection === 'user') {
        if (selectedPublicUserPrincipal) { 
            return userPublicShelfTitleFilter
            ? "No public shelves match your title filter for this user."
            : (fetchedUserPublicShelves.length === 0 && !isLoadingUserPublicShelves
                ? `No publicly editable shelves found for this user.`
                : "Filter shelves by title or select one.");
        } else { 
            return "Select a user to see their public shelves.";
        }
      }
    }
    return "No shelves available.";
  }, [
    searchMode, myShelvesSearchTerm, publicDiscoverActiveSection,
    selectedPublicTag, publicShelfTitleFilter, fetchedPublicShelves, isLoadingPublicShelves,
    publicTagSearchTerm, isTagSearchLoading, tagSearchResults,
    selectedPublicUserPrincipal, userPublicShelfTitleFilter, fetchedUserPublicShelves, isLoadingUserPublicShelves
  ]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) handleDialogClose(); }}>
      <DialogContent 
        className="sm:max-w-md font-serif" 
        onClick={(e) => e.stopPropagation()}
        aria-describedby={descriptionId}
      >
        {isLoading ? ( // This is for initial loading of user's own shelves
          <div className="flex flex-col items-center justify-center py-8 font-serif">
            <DialogHeader>
              <DialogTitle>Loading Content</DialogTitle> 
            </DialogHeader>
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
                   : searchMode === 'publicDiscovery'
                     ? publicDiscoverActiveSection === 'tag'
                       ? selectedPublicTag 
                         ? `Public shelves for tag: "${selectedPublicTag}". Select or filter by title.`
                         : "Search for public shelves by tag."
                       : selectedPublicUserPrincipal // User search section
                         ? `Public shelves for selected user. Select or filter by title.`
                         : "Search for a user to see their public shelves."
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
                  variant={searchMode === 'publicDiscovery' ? 'primary' : 'outline'} 
                  onClick={() => { setSearchMode('publicDiscovery'); /* Default to tag or user? Let's keep last or set default */ }}
                  className="flex-1"
                  disabled={disableInteractions}
                >
                  Discover Public
                </Button>
              </div>
            )}
            
            {/* --- Content for 'My Shelves' mode --- */}
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

            {/* --- Content for 'Discover Public' mode --- */}
            {!isEnteringTitleMode && searchMode === 'publicDiscovery' && (
              <>
                {/* Sub-mode Toggles for Discover Public */}
                <div className="flex gap-1 mb-3 p-1 bg-muted rounded-md">
                  <Button
                    variant={publicDiscoverActiveSection === 'user' ? 'primary' : 'ghost'}
                    onClick={() => setPublicDiscoverActiveSection('user')}
                    className="flex-1 h-8 text-xs sm:h-9 sm:text-sm"
                    disabled={disableInteractions}
                  >
                    By User
                  </Button>
                  <Button
                    variant={publicDiscoverActiveSection === 'tag' ? 'primary' : 'ghost'}
                    onClick={() => setPublicDiscoverActiveSection('tag')}
                    className="flex-1 h-8 text-xs sm:h-9 sm:text-sm"
                    disabled={disableInteractions}
                  >
                    By Tag
                  </Button>
                </div>

                {/* Content for 'Discover Public' -> 'By User' */}
                {publicDiscoverActiveSection === 'user' && (
                  <div className="mb-4">
                    <div style={{ display: !selectedPublicUserPrincipal ? 'block' : 'none' }}>
                      <div className="min-h-[150px]"> {/* Ensure PrincipalSelector has enough space */}
                        <AlexBackendActor><PrincipalSelector 
                          onPrincipalSelected={handleUserPrincipalSelect} 
                          defaultPrincipal="new" // Or any other appropriate default
                          performDefaultActions={false} // CRUCIAL: Set this to false
                          showMostRecentOption={false}
                        /></AlexBackendActor>
                      </div>
                    </div>
                    {selectedPublicUserPrincipal && (
                      <>
                        <Button ref={backToUserSearchButtonRef} variant="ghost" onClick={handleBackToUserSearch} className="text-sm px-2 py-1 h-auto mb-2" disabled={disableInteractions || isLoadingUserPublicShelves}>
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to User Search
                        </Button>
                        <Input
                            type="text"
                            placeholder="Filter user's public shelves by title..."
                            value={userPublicShelfTitleFilter}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserPublicShelfTitleFilter(e.target.value)}
                            className="font-sans mb-2"
                            disabled={disableInteractions || isLoadingUserPublicShelves}
                        />
                      </>
                    )}
                    {/* Display for user's public shelves is handled by the main shelvesToDisplay list */}
                  </div>
                )}

                {/* Content for 'Discover Public' -> 'By Tag' */}
                {publicDiscoverActiveSection === 'tag' && (
                  <>
                    {!selectedPublicTag ? ( // Show tag search input if no tag is selected
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
                    ) : ( // Show shelf filter and back button if a tag IS selected
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
                            disabled={disableInteractions || isLoadingPublicShelves}
                    autoFocus
                />
              </div>
                    )}
                  </>
                )}
              </>
            )}
            
            {/* Search Inputs & Back Button */}
            {/* MOVED: MyShelves search input is now conditional based on searchMode */}
            {/* MOVED: Tag search input and public shelf view are now conditional based on searchMode and publicDiscoverActiveSection */}


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
            {!isEnteringTitleMode && (searchMode === 'myShelves' || (searchMode === 'publicDiscovery' && (selectedPublicTag || selectedPublicUserPrincipal)) ) ? (
              isLoadingCurrentPublicList ? (
                <div className="flex flex-col items-center justify-center py-8 font-serif">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {isLoadingUserPublicShelves ? "Loading user's public shelves..." : 
                       isLoadingPublicShelves ? "Loading public shelves by tag..." : "Loading shelves..."}
                    </p>
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
                          {(searchMode === 'publicDiscovery' && shelf.owner) && ( // Check if in public discovery and owner exists
                            <span className="ml-2 text-xs text-muted-foreground truncate">
                              by {typeof shelf.owner === 'string' ? Principal.fromText(shelf.owner).toText().substring(0,5) : shelf.owner.toText().substring(0,5)}...
                            </span>
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
            ) : !isEnteringTitleMode && searchMode === 'publicDiscovery' && publicDiscoverActiveSection === 'tag' && !selectedPublicTag && !isTagSearchLoading && tagSearchResults.length === 0 && publicTagSearchTerm ? (
                 <div className="text-center py-4 text-muted-foreground font-serif">
                  {emptyListMessage()}
                </div>
            // Add a similar empty message for user search initial state if needed
            ) : !isEnteringTitleMode && searchMode === 'publicDiscovery' && publicDiscoverActiveSection === 'user' && !selectedPublicUserPrincipal ? (
                 <div className="text-center py-4 text-muted-foreground font-serif">
                  {/* This is already handled by the placeholder above, but could be an emptyListMessage() call if preferred */}
                  Select a user to discover their publicly editable shelves.
                 </div>
            ) : null }
            
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
                ) : (<div className="w-full sm:w-auto"></div>) /* Placeholder to keep alignment when not in MyShelves mode */}
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