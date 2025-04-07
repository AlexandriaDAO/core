import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
  setSelectedShelf, 
  selectSelectedShelf,
  selectShelfById,
  selectUserShelvesForUser,
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
} from "../features/shelf-management/containers/ShelfLists";
import { NewItemDialog } from "../features/items";
import { default as NewShelfDialog } from "../features/shelf-management/components/NewShelf";
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
  const currentSelectedShelfId = useAppSelector(state => state.perpetua.selectedShelfId); // Direct access for comparison
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
  
  // Get user-specific shelves from Redux
  const userShelves = useAppSelector(state => userId ? selectUserShelvesForUser(state, userId) : []);
  const [userShelvesLoading, setUserShelvesLoading] = useState(false);
  
  // Load shelves when viewing a specific user's profile (modified to prevent loops)
  useEffect(() => {
    if (isUserDetail && userId && userId !== userPrincipal && !userShelvesLoading) {
      setUserShelvesLoading(true);
      // Dispatch loadShelves and let Redux handle state management
      dispatch(loadShelves(userId))
        .unwrap()
        .then(() => {
          setUserShelvesLoading(false);
        })
        .catch(() => {
          setUserShelvesLoading(false);
        });
    }
  }, [dispatch, isUserDetail, userId, userPrincipal, userShelvesLoading]);
  
  // Handle shelf selection when route changes - simplified dependencies
  useEffect(() => {
    if (shelfId && shelfId !== currentSelectedShelfId) {
      // Only dispatch if the route shelfId is different from the current state
      dispatch(setSelectedShelf(shelfId));
    }
  }, [shelfId, currentSelectedShelfId, dispatch]); // Depends only on IDs and dispatch
  
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
          onAddItem={handleAddItem}
          hasEditAccess={checkEditAccess(denormalizedShelf.shelf_id)}
        />
      );
    }
    
    // If we're viewing the main shelves view
    if (isMainView) {
      // Deduplicate shelves when combining personal and public
      const seenShelfIds = new Set<string>();
      const uniqueShelves: NormalizedShelf[] = [];
      
      // Add personal shelves first (they take priority)
      shelves.forEach(shelf => {
        if (!seenShelfIds.has(shelf.shelf_id)) {
          seenShelfIds.add(shelf.shelf_id);
          uniqueShelves.push(shelf);
        }
      });
      
      // Then add unique public shelves
      publicShelves.forEach(shelf => {
        if (!seenShelfIds.has(shelf.shelf_id)) {
          seenShelfIds.add(shelf.shelf_id);
          uniqueShelves.push(shelf);
        }
      });
      
      const denormalizedPersonalShelves = denormalizeShelves(shelves);
      const allDenormalizedShelves = denormalizeShelves(uniqueShelves);
      
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