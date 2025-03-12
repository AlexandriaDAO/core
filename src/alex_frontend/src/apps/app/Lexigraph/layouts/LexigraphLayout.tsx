import React, { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { Library, Globe } from "lucide-react";
import { useLexigraphNavigation, useViewState } from "../routes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
  setSelectedShelf, 
  selectSelectedShelf,
} from "@/apps/Modules/shared/state/lexigraph/lexigraphSlice";
import { createFindSlotInShelf } from "../utils";
import { useShelfOperations, usePublicShelfOperations } from "../features/shelf-management/hooks";

// Import UI components
import {
  SlotDetail,
  ShelfDetailUI,
  LibraryShelvesUI,
  ExploreShelvesUI,
  UserShelvesUI
} from "../features/cards";
import { ShelfSettings, ShelfSettingsDialog } from "../features/shelf-settings";
import { NewSlotDialog } from "../features/slots";
import { NewShelfDialog, ShelfDetail } from "../features/shelf-management/components";

const LexigraphLayout: React.FC = () => {
  const { shelves, loading, createShelf, addSlot, reorderSlot } = useShelfOperations();
  const { publicShelves, loading: publicLoading, loadMoreShelves } = usePublicShelfOperations();
  const [isNewShelfDialogOpen, setIsNewShelfDialogOpen] = useState(false);
  const [isNewSlotDialogOpen, setIsNewSlotDialogOpen] = useState(false);
  const dispatch = useAppDispatch();
  const selectedShelf = useAppSelector(selectSelectedShelf);
  
  // Use navigation hooks
  const { 
    goToShelves, 
    goToShelf, 
    goToSlot, 
    switchTab
  } = useLexigraphNavigation();
  
  // Use the view state hook
  const { viewFlags, params } = useViewState();
  const { shelfId, slotId, userId } = params;
  const { 
    isExplore, 
    isShelfDetail,
    isSlotDetail,
    isUserDetail,
    isMainView,
    isPublicContext
  } = viewFlags;
  
  // Derive active tab directly from route state
  const activeTab = isExplore ? "explore" : "library";
  
  // Handle shelf selection
  useEffect(() => {
    if (shelfId) {
      // Find the shelf in either personal or public shelves
      const shelf = isPublicContext
        ? publicShelves.find(s => s.shelf_id === shelfId)
        : shelves.find(s => s.shelf_id === shelfId);
      
      if (shelf) {
        dispatch(setSelectedShelf(shelf));
      }
    }
  }, [shelfId, shelves, publicShelves, dispatch, isPublicContext]);
  
  // Handle adding a new slot to a shelf
  const handleAddSlot = useCallback(() => {
    setIsNewSlotDialogOpen(true);
  }, []);
  
  // Handle creating a new shelf
  const handleCreateShelf = useCallback(() => {
    setIsNewShelfDialogOpen(true);
  }, []);
  
  // Handle submitting a new shelf
  const handleNewShelfSubmit = useCallback(async (title: string, description: string) => {
    await createShelf(title, description);
    setIsNewShelfDialogOpen(false);
  }, [createShelf]);
  
  // Handle submitting a new slot
  const handleNewSlotSubmit = useCallback(async (content: string, type: "Nft" | "Markdown" | "Shelf") => {
    if (selectedShelf) {
      await addSlot(selectedShelf, content, type);
      setIsNewSlotDialogOpen(false);
    }
  }, [selectedShelf, addSlot]);
  
  // Handle reordering slots
  const handleReorderSlot = useCallback(async (shelfId: string, slotId: number, referenceSlotId: number | null, before: boolean) => {
    await reorderSlot(shelfId, slotId, referenceSlotId, before);
  }, [reorderSlot]);
  
  // Render the appropriate view based on the route
  const renderView = () => {
    // If we're viewing a specific slot
    if (isSlotDetail && slotId !== undefined) {
      // Find the slot in the selected shelf
      if (selectedShelf) {
        const findSlot = createFindSlotInShelf(selectedShelf);
        const slot = findSlot(Number(slotId));
        
        if (slot) {
          return (
            <SlotDetail 
              slot={slot} 
              shelf={selectedShelf}
              slotKey={Number(slotId)}
              onBack={goToShelves}
              onBackToShelf={(shelfId) => goToShelf(shelfId)}
            />
          );
        }
      }
      return <div>Slot not found</div>;
    }
    
    // If we're viewing a specific shelf
    if (isShelfDetail && selectedShelf) {
      return (
        <ShelfDetail 
          shelf={selectedShelf}
          onBack={goToShelves}
          onAddSlot={!isPublicContext ? handleAddSlot : undefined}
          onReorderSlot={!isPublicContext ? handleReorderSlot : undefined}
          onViewSlot={(slotId) => goToSlot(slotId)}
          isPublic={isPublicContext}
        />
      );
    }
    
    // If we're viewing the main shelves view
    if (isMainView) {
      return (
        <Tabs defaultValue={activeTab} className="w-full" onValueChange={switchTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="explore" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Explore
            </TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="mt-4">
            <LibraryShelvesUI 
              shelves={shelves}
              loading={loading}
              onNewShelf={handleCreateShelf}
              onViewShelf={(shelfId: string) => goToShelf(shelfId)}
            />
          </TabsContent>
          <TabsContent value="explore" className="mt-4">
            <ExploreShelvesUI 
              shelves={publicShelves}
              loading={publicLoading}
              onLoadMore={loadMoreShelves}
              onViewShelf={(shelfId: string) => goToShelf(shelfId)}
            />
          </TabsContent>
        </Tabs>
      );
    }
    
    // If we're viewing a specific user's shelves
    if (isUserDetail && userId) {
      return (
        <UserShelvesUI 
          shelves={publicShelves.filter(shelf => 
            shelf.owner.toString() === userId
          )}
          loading={publicLoading}
          onBack={goToShelves}
          onViewShelf={(shelfId: string) => goToShelf(shelfId)}
        />
      );
    }
    
    // Fallback
    return <div>Loading...</div>;
  };
  
  return (
    <div className="container mx-auto p-4">
      {renderView()}
      
      {/* Dialogs */}
      <NewShelfDialog 
        isOpen={isNewShelfDialogOpen}
        onClose={() => setIsNewShelfDialogOpen(false)}
        onSubmit={handleNewShelfSubmit}
      />
      
      <NewSlotDialog 
        isOpen={isNewSlotDialogOpen}
        onClose={() => setIsNewSlotDialogOpen(false)}
        onSubmit={handleNewSlotSubmit}
      />
    </div>
  );
};

export default LexigraphLayout; 