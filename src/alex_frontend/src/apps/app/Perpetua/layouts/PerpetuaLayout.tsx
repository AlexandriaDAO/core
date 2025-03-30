import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
  setSelectedShelf, 
  selectSelectedShelf,
  selectUserPrincipal,
  NormalizedShelf
} from "@/apps/app/Perpetua/state/perpetuaSlice";
import { usePerpetuaNavigation, useViewState } from "../routes";
import { useShelfOperations, usePublicShelfOperations } from "../features/shelf-management/hooks";
import { useContentPermissions } from "../hooks/useContentPermissions";
import { Principal } from "@dfinity/principal";
import { Shelf } from "@/../../declarations/perpetua/perpetua.did";

// Import UI components
import {
  UnifiedShelvesUI,
  UserShelvesUI
} from "../features/cards";
import { NewItemDialog } from "../features/items";
import { NewShelfDialog } from "../features/shelf-management/components";
import { ShelfDetailContainer } from "../features/shelf-management/containers/ShelfDetailContainer";

/**
 * Convert a NormalizedShelf back to a Shelf for API calls and components
 */
const denormalizeShelf = (normalizedShelf: NormalizedShelf): Shelf => {
  return {
    ...normalizedShelf,
    owner: Principal.fromText(normalizedShelf.owner)
  } as Shelf;
};

/**
 * Convert an array of NormalizedShelf objects to Shelf objects
 */
const denormalizeShelves = (normalizedShelves: NormalizedShelf[]): Shelf[] => {
  return normalizedShelves.map(denormalizeShelf);
};

const PerpetuaLayout: React.FC = () => {
  // Core data hooks
  const { shelves, loading: personalLoading, createShelf, addItem, reorderItem } = useShelfOperations();
  const { publicShelves, loading: publicLoading, loadMoreShelves } = usePublicShelfOperations();
  
  // Dialog state
  const [isNewShelfDialogOpen, setIsNewShelfDialogOpen] = useState(false);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  
  // Redux state
  const dispatch = useAppDispatch();
  const selectedShelf = useAppSelector(selectSelectedShelf);
  const userPrincipal = useAppSelector(selectUserPrincipal);
  
  // Permissions
  const { checkEditAccess } = useContentPermissions();
  
  // Navigation
  const { goToShelves, goToShelf, goToUser, goToMainShelves } = usePerpetuaNavigation();
  
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
        dispatch(setSelectedShelf(shelf.shelf_id)); // Pass just the ID to avoid type issues
      }
    }
  }, [shelfId, shelves, publicShelves, dispatch, userId]);
  
  // Action handlers
  const handleAddItem = useCallback(() => setIsNewItemDialogOpen(true), []);
  const handleCreateShelf = useCallback(() => setIsNewShelfDialogOpen(true), []);
  
  const handleNewShelfSubmit = useCallback(async (title: string, description: string) => {
    await createShelf(title, description);
    setIsNewShelfDialogOpen(false);
  }, [createShelf]);
  
  const handleNewItemSubmit = useCallback(async (content: string, type: "Nft" | "Markdown" | "Shelf") => {
    if (selectedShelf) {
      // Convert NormalizedShelf to Shelf for the API call
      const denormalizedShelf = denormalizeShelf(selectedShelf);
      await addItem(denormalizedShelf, content, type);
      setIsNewItemDialogOpen(false);
    }
  }, [selectedShelf, addItem]);
  
  const handleReorderItem = useCallback(async (shelfId: string, itemId: number, referenceItemId: number | null, before: boolean) => {
    await reorderItem(shelfId, itemId, referenceItemId, before);
  }, [reorderItem]);
  
  // Render the appropriate view based on the route
  const renderView = () => {
    // If we're viewing a specific shelf
    if (isShelfDetail && selectedShelf) {
      const hasEditAccess = checkEditAccess(selectedShelf.shelf_id);
      const denormalizedShelf = denormalizeShelf(selectedShelf);
      
      return (
        <ShelfDetailContainer 
          shelf={denormalizedShelf}
          onBack={goToShelves}
          onAddItem={hasEditAccess ? handleAddItem : undefined}
          onReorderItem={hasEditAccess ? handleReorderItem : undefined}
          hasEditAccess={hasEditAccess}
        />
      );
    }
    
    // If we're viewing the main shelves view
    if (isMainView) {
      // Combine all shelves in one view and denormalize them
      const allNormalizedShelves = [...shelves, ...publicShelves];
      const allDenormalizedShelves = denormalizeShelves(allNormalizedShelves);
      const denormalizedPersonalShelves = denormalizeShelves(shelves);
      
      return (
        <UnifiedShelvesUI 
          allShelves={allDenormalizedShelves}
          personalShelves={denormalizedPersonalShelves}
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
      const userNormalizedShelves = publicShelves.filter(shelf => 
        shelf.owner === userId // Owner is already a string in NormalizedShelf
      );
      const userDenormalizedShelves = denormalizeShelves(userNormalizedShelves);
      
      // Check if this is the current user's profile
      const isCurrentUserProfile = userPrincipal === userId;
      
      return (
        <UserShelvesUI 
          shelves={userDenormalizedShelves}
          loading={publicLoading}
          onViewShelf={goToShelf}
          onViewOwner={goToUser}
          onBack={goToMainShelves}
          isCurrentUser={isCurrentUserProfile}
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
      
      <NewItemDialog 
        isOpen={isNewItemDialogOpen}
        onClose={() => setIsNewItemDialogOpen(false)}
        onSubmit={handleNewItemSubmit}
      />
    </>
  );
};

export default PerpetuaLayout; 