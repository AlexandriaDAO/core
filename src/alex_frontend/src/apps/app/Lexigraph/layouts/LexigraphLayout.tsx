import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
  setSelectedShelf, 
  selectSelectedShelf,
} from "@/apps/Modules/shared/state/lexigraph/lexigraphSlice";
import { useLexigraphNavigation, useViewState } from "../routes";
import { useShelfOperations, usePublicShelfOperations } from "../features/shelf-management/hooks";
import { useContentPermissions } from "../hooks/useContentPermissions";

// Import UI components
import {
  UnifiedShelvesUI,
  UserShelvesUI
} from "../features/cards";
import { NewSlotDialog } from "../features/slots";
import { NewShelfDialog } from "../features/shelf-management/components";
import { ShelfDetailContainer } from "../features/shelf-management/containers/ShelfDetailContainer";

const LexigraphLayout: React.FC = () => {
  // Core data hooks
  const { shelves, loading: personalLoading, createShelf, addSlot, reorderSlot } = useShelfOperations();
  const { publicShelves, loading: publicLoading, loadMoreShelves } = usePublicShelfOperations();
  
  // Dialog state
  const [isNewShelfDialogOpen, setIsNewShelfDialogOpen] = useState(false);
  const [isNewSlotDialogOpen, setIsNewSlotDialogOpen] = useState(false);
  
  // Redux state
  const dispatch = useAppDispatch();
  const selectedShelf = useAppSelector(selectSelectedShelf);
  
  // Permissions
  const { checkEditAccess } = useContentPermissions();
  
  // Navigation
  const { goToShelves, goToShelf, goToUser, goToMainShelves } = useLexigraphNavigation();
  
  // View state
  const { viewFlags, params } = useViewState();
  const { shelfId, userId } = params;
  const { isShelfDetail, isUserDetail, isMainView } = viewFlags;
  
  // Handle shelf selection when route changes
  useEffect(() => {
    if (shelfId) {
      // Find the shelf in either personal or public shelves
      const shelf = userId
        ? publicShelves.find(s => s.shelf_id === shelfId)
        : [...shelves, ...publicShelves].find(s => s.shelf_id === shelfId);
      
      if (shelf) {
        dispatch(setSelectedShelf(shelf));
      }
    }
  }, [shelfId, shelves, publicShelves, dispatch, userId]);
  
  // Action handlers
  const handleAddSlot = useCallback(() => setIsNewSlotDialogOpen(true), []);
  const handleCreateShelf = useCallback(() => setIsNewShelfDialogOpen(true), []);
  
  const handleNewShelfSubmit = useCallback(async (title: string, description: string) => {
    await createShelf(title, description);
    setIsNewShelfDialogOpen(false);
  }, [createShelf]);
  
  const handleNewSlotSubmit = useCallback(async (content: string, type: "Nft" | "Markdown" | "Shelf") => {
    if (selectedShelf) {
      await addSlot(selectedShelf, content, type);
      setIsNewSlotDialogOpen(false);
    }
  }, [selectedShelf, addSlot]);
  
  const handleReorderSlot = useCallback(async (shelfId: string, slotId: number, referenceSlotId: number | null, before: boolean) => {
    await reorderSlot(shelfId, slotId, referenceSlotId, before);
  }, [reorderSlot]);
  
  // Render the appropriate view based on the route
  const renderView = () => {
    // If we're viewing a specific shelf
    if (isShelfDetail && selectedShelf) {
      const hasEditAccess = checkEditAccess(selectedShelf.shelf_id);
      
      return (
        <ShelfDetailContainer 
          shelf={selectedShelf}
          onBack={goToShelves}
          onAddSlot={hasEditAccess ? handleAddSlot : undefined}
          onReorderSlot={hasEditAccess ? handleReorderSlot : undefined}
          hasEditAccess={hasEditAccess}
        />
      );
    }
    
    // If we're viewing the main shelves view
    if (isMainView) {
      // Combine all shelves in one view
      const allShelves = [...shelves, ...publicShelves];
      
      return (
        <UnifiedShelvesUI 
          allShelves={allShelves}
          personalShelves={shelves}
          loading={personalLoading || publicLoading}
          onNewShelf={handleCreateShelf}
          onViewShelf={goToShelf}
          onViewOwner={goToUser}
          onLoadMore={loadMoreShelves}
          checkEditAccess={checkEditAccess}
        />
      );
    }
    
    // If we're viewing a specific user's shelves
    if (isUserDetail && userId) {
      const userShelves = publicShelves.filter(shelf => 
        shelf.owner.toString() === userId
      );
      
      return (
        <UserShelvesUI 
          shelves={userShelves}
          loading={publicLoading}
          onViewShelf={goToShelf}
          onViewOwner={goToUser}
          onBack={goToMainShelves}
        />
      );
    }
    
    // Fallback
    return <div>Loading...</div>;
  };
  
  return (
    <>
      {/* Render the shelf detail view directly without any wrappers */}
      {isShelfDetail && selectedShelf ? (
        renderView()
      ) : (
        /* Use container for other views */
        <div className="container mx-auto p-4">
          {renderView()}
        </div>
      )}
      
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
    </>
  );
};

export default LexigraphLayout; 