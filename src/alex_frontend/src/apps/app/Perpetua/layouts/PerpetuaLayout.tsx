import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
  setSelectedShelf, 
  selectSelectedShelf,
  NormalizedShelf
} from "@/apps/app/Perpetua/state/perpetuaSlice";
import { usePerpetuaNavigation, useViewState } from "../routes";
import { useShelfOperations, usePublicShelfOperations } from "../features/shelf-management/hooks";
import { useContentPermissions } from "../hooks/useContentPermissions";
import { Principal } from "@dfinity/principal";
import { Shelf } from "@/../../declarations/perpetua/perpetua.did";
import { loadShelves } from "../state";

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
 * Utility function to convert array of normalized shelves to denormalized shelves
 */
const denormalizeShelves = (shelves: NormalizedShelf[]): Shelf[] => {
  return shelves.map(denormalizeShelf);
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
  // Direct state access to auth principal - single source of truth
  const userPrincipal = useAppSelector(state => state.auth.user?.principal);
  
  // Permissions
  const { checkEditAccess } = useContentPermissions();
  
  // Navigation
  const { goToShelves, goToShelf, goToUser, goToMainShelves } = usePerpetuaNavigation();
  
  // View state
  const { viewFlags, params } = useViewState();
  const { shelfId, userId } = params;
  const { isShelfDetail, isUserDetail, isMainView } = viewFlags;
  
  // State for user-specific shelves and loading status
  const [userShelves, setUserShelves] = useState<NormalizedShelf[]>([]);
  const [userShelvesLoading, setUserShelvesLoading] = useState(false);
  
  // Load shelves when viewing a specific user's profile
  useEffect(() => {
    if (isUserDetail && userId) {
      setUserShelvesLoading(true);
      // Here we directly dispatch loadShelves with the userId instead of filtering
      // from publicShelves, which will ensure proper order from the backend
      dispatch(loadShelves(userId))
        .unwrap()
        .then((loadedShelves) => {
          // Convert Shelf[] to NormalizedShelf[] by extracting strings from principals
          const normalizedShelves = loadedShelves.map(shelf => ({
            ...shelf,
            owner: typeof shelf.owner === 'string' ? shelf.owner : shelf.owner.toString()
          }));
          setUserShelves(normalizedShelves);
          setUserShelvesLoading(false);
        })
        .catch(() => {
          setUserShelvesLoading(false);
        });
    }
  }, [dispatch, isUserDetail, userId]);
  
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
    if (!selectedShelf) return;
    
    const shelf = denormalizeShelf(selectedShelf);
    await addItem(shelf, content, type);
    setIsNewItemDialogOpen(false);
  }, [selectedShelf, addItem]);
  
  // Render view based on current URL and state
  const renderView = () => {
    // If we're viewing a shelf
    if (isShelfDetail && selectedShelf) {
      const denormalizedShelf = denormalizeShelf(selectedShelf);
      
      return (
        <ShelfDetailContainer
          shelf={denormalizedShelf}
          onBack={goToShelves}
          onAddItem={hasEditAccess => hasEditAccess ? handleAddItem : undefined}
        />
      );
    }
    
    // If we're viewing the main shelves view
    if (isMainView) {
      // Combine personal and public shelves
      const allShelves = [...shelves, ...publicShelves];
      const denormalizedPersonalShelves = denormalizeShelves(shelves);
      const allDenormalizedShelves = denormalizeShelves(allShelves);
      
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
      // Check if this is the current user's profile
      const isCurrentUserProfile = userPrincipal === userId;
      
      // Use directly loaded user shelves instead of filtering from publicShelves
      const userDenormalizedShelves = denormalizeShelves(userShelves);
      
      return (
        <UserShelvesUI 
          shelves={userDenormalizedShelves}
          loading={userShelvesLoading}
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