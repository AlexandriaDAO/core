import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { RootState } from "@/store";
import { 
  setSelectedShelf, 
  selectSelectedShelf,
  selectShelfById,
  selectUserShelvesForUser,
  NormalizedShelf,
  selectCurrentTagFilter,
  selectIsCreatingShelf
} from "@/apps/app/Perpetua/state/perpetuaSlice";
import { usePerpetuaNavigation, useViewState } from "../routes";
import { useShelfOperations, usePublicShelfOperations } from "../features/shelf-management/hooks";
import { useContentPermissions } from "../hooks/useContentPermissions";
import { Principal } from "@dfinity/principal";
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";
import { loadShelves } from "../state";
import { useIdentity } from "@/hooks/useIdentity";
import { useUsername } from '@/hooks/useUsername';

// Import UI components
import {
  UnifiedShelvesUI,
  UserShelvesUI
} from "../features/shelf-management/containers/ShelfLists";
import { default as NewShelfDialog } from "../features/shelf-management/components/NewShelf";
import { ShelfDetailContainer } from "../features/shelf-management/containers/ShelfDetailContainer";
import { Button } from "@/lib/components/button";

// Import Tag components
import { PopularTagsList } from '../features/tags/components/PopularTagsList';
import { TagSearchBar } from '../features/tags/components/TagSearchBar';
import { TagFilterDisplay } from '../features/tags/components/TagFilterDisplay';
import { FilteredShelfListContainer } from '../features/tags/containers/FilteredShelfListContainer';

// Import Following components
import { FollowedTagsList } from '../features/following/components/FollowedTagsList';
import { FollowedUsersList } from '../features/following/components/FollowedUsersList';

/**
 * Convert a NormalizedShelf back to a Shelf for API calls and components
 */
const denormalizeShelf = (normalizedShelf: NormalizedShelf): ShelfPublic => {
  // Ensure conversion back to BigInt for ShelfPublic type
  return {
    ...normalizedShelf,
    owner: Principal.fromText(normalizedShelf.owner),
    created_at: BigInt(normalizedShelf.created_at), // Convert string back to BigInt
    updated_at: BigInt(normalizedShelf.updated_at)  // Convert string back to BigInt
  } as ShelfPublic;
};

/**
 * Utility function to convert array of normalized shelves to denormalized shelves
 */
const denormalizeShelves = (shelves: NormalizedShelf[]): ShelfPublic[] => {
  return shelves.map(denormalizeShelf);
};

const PerpetuaLayout: React.FC = () => {

  // Core data hooks
  const { shelves: personalNormalizedShelves, loading: personalLoading, createShelf, addItem, setItemOrder } = useShelfOperations();
  const { publicShelves: publicNormalizedShelves, loading: publicLoading, loadMoreShelves } = usePublicShelfOperations();
  
  // Dialog state
  const [isNewShelfDialogOpen, setIsNewShelfDialogOpen] = useState(false);
  
  // Redux state
  const dispatch = useAppDispatch();
  const selectedShelf = useAppSelector(selectSelectedShelf);
  const currentSelectedShelfId = useAppSelector(state => state.perpetua.selectedShelfId); // Direct access for comparison
  const authUser = useAppSelector(state => state.auth.user);
  const userPrincipal = authUser?.principal;
  const { identity } = useIdentity();
  const currentTagFilter = useAppSelector(selectCurrentTagFilter); // Get the active tag filter
  const isCreatingShelf = useAppSelector(selectIsCreatingShelf); // Get the loading state
  
  // Define a stable empty array reference
  const stableEmptyShelves: NormalizedShelf[] = useMemo(() => [], []);
  
  // Permissions
  const { checkEditAccess } = useContentPermissions();
  
  // Navigation
  const { goToShelves, goToShelf, goToUser, goToMainShelves } = usePerpetuaNavigation();
  
  // View state
  const { viewFlags, params } = useViewState();
  const { shelfId, userId: routeUserId } = params;
  const { isShelfDetail, isUserDetail, isMainView } = viewFlags;
  
  // Fetch username for the user ID from the route
  const { username: routeUsername, isLoading: isLoadingRouteUsername } = useUsername(routeUserId);
  
  // Get user-specific shelves from Redux using a stable approach
  const userShelvesSelector = useMemo(() => {
    // Only create the specific selector if userId is present
    // Ensure the function signature matches what useSelector expects
    return routeUserId ? (state: RootState) => selectUserShelvesForUser(state, routeUserId) : null;
  }, [routeUserId]);

  // Use the memoized selector, or default to the stable empty array
  const userShelves = useAppSelector(state => userShelvesSelector ? userShelvesSelector(state) : stableEmptyShelves);
  const [userShelvesLoading, setUserShelvesLoading] = useState(false);
  
  // Memoize the combined and unique shelves for the main view
  const uniqueNormalizedShelves = useMemo(() => {
    if (!isMainView) return [];
    
    const seenShelfIds = new Set<string>();
    const uniqueShelves: NormalizedShelf[] = [];
    
    // Add personal shelves first (they take priority)
    personalNormalizedShelves.forEach((shelf: NormalizedShelf) => {
      if (!seenShelfIds.has(shelf.shelf_id)) {
        seenShelfIds.add(shelf.shelf_id);
        uniqueShelves.push(shelf);
      }
    });
    
    // Then add unique public shelves
    (publicNormalizedShelves as NormalizedShelf[]).forEach((shelf: NormalizedShelf) => {
      if (!seenShelfIds.has(shelf.shelf_id)) {
        seenShelfIds.add(shelf.shelf_id);
        uniqueShelves.push(shelf);
      }
    });
    
    return uniqueShelves;
  }, [isMainView, personalNormalizedShelves, publicNormalizedShelves]);

  // Memoize the denormalized versions of the shelf lists
  const allDenormalizedShelves = useMemo(() => 
    denormalizeShelves(uniqueNormalizedShelves),
    [uniqueNormalizedShelves]
  );

  const denormalizedPersonalShelves = useMemo(() => 
    denormalizeShelves(personalNormalizedShelves), 
    [personalNormalizedShelves]
  );
  
  // Global initialization of shelves
  useEffect(() => {
    if (identity) {
      // Load the current user's shelves as soon as the layout mounts
      dispatch(loadShelves({ 
        principal: identity.getPrincipal(), 
        params: { offset: 0, limit: 20 }
      }))
        .unwrap()
        .catch((error) => {
          console.error("Failed to load shelves:", error);
        });
    }
  }, [identity, dispatch]);
  
  // Load shelves when viewing a specific user's profile (modified to prevent loops)
  useEffect(() => {
    if (isUserDetail && routeUserId && routeUserId !== userPrincipal && !userShelvesLoading) {
      setUserShelvesLoading(true);
      // Dispatch loadShelves and let Redux handle state management
      dispatch(loadShelves({ 
        principal: routeUserId, 
        params: { offset: 0, limit: 20 }
      }))
        .unwrap()
        .then(() => {
          setUserShelvesLoading(false);
        })
        .catch(() => {
          setUserShelvesLoading(false);
        });
    }
  }, [dispatch, isUserDetail, routeUserId, userPrincipal, userShelvesLoading]);
  
  // Handle shelf selection when route changes - simplified dependencies
  useEffect(() => {
    if (shelfId && shelfId !== currentSelectedShelfId) {
      // Only dispatch if the route shelfId is different from the current state
      dispatch(setSelectedShelf(shelfId));
    }
  }, [shelfId, currentSelectedShelfId, dispatch]); // Depends only on IDs and dispatch
  
  // Action handlers
  const handleCreateShelf = useCallback(() => setIsNewShelfDialogOpen(true), []);
  
  const handleNewShelfSubmit = useCallback(async (title: string, description: string) => {
    await createShelf(title, description);
    setIsNewShelfDialogOpen(false);
  }, [createShelf]);
  
  // Render view based on current URL and state
  const renderView = () => {
    // If we're viewing a shelf
    if (isShelfDetail && selectedShelf) {
      const denormalizedShelf = denormalizeShelf(selectedShelf);
      
      return (
        <ShelfDetailContainer
          shelf={denormalizedShelf}
          onBack={goToShelves}
        />
      );
    }
    
    // If we're viewing the main shelves view
    if (isMainView) {
      return (
        <>
          {userPrincipal && (
            <div className="mb-4">
              <Button onClick={() => goToUser(userPrincipal.toString())}>
                My Library
              </Button>
            </div>
          )}
          {/* Add Tag Components */} 
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start">
            <div className="flex-grow">
              <PopularTagsList />
            </div>
            <TagSearchBar />
          </div>

          {/* Following Lists (Placeholders) */}
          {/* TODO: Implement data fetching for these lists */}
          <FollowedTagsList />
          <FollowedUsersList />

          <TagFilterDisplay />

          {/* Conditional Shelf List */} 
          {currentTagFilter ? (
            // Show filtered list if a tag is selected
            <FilteredShelfListContainer /> 
          ) : (
            // Show default unified list if no tag is selected
            <UnifiedShelvesUI 
              allShelves={allDenormalizedShelves}
              personalShelves={denormalizedPersonalShelves}
              loading={personalLoading || publicLoading}
              onNewShelf={handleCreateShelf}
              onViewShelf={goToShelf}
              onViewOwner={goToUser}
              onLoadMore={loadMoreShelves}
              checkEditAccess={checkEditAccess}
              isCreatingShelf={isCreatingShelf}
            />
          )}
        </>
      );
    }
    
    // If we're viewing a specific user's shelves
    if (isUserDetail && routeUserId) {
      const isCurrentUserProfile = userPrincipal === routeUserId;
      
      // Determine the username to display
      // If it's the current user's profile, authUser.username might be available and fresher initially
      // Otherwise, use the fetched routeUsername
      let displayedUsername: string | undefined = undefined;
      if (isCurrentUserProfile && authUser && typeof (authUser as any).username === 'string') {
        displayedUsername = (authUser as any).username;
      } else if (routeUsername) {
        displayedUsername = routeUsername;
      } else if (isLoadingRouteUsername) {
        // Optionally, show principal or loading indicator while username is loading for other users
        displayedUsername = `Loading user...`; // Or routeUserId to show principal
      } else {
        // Fallback if username couldn't be fetched
        displayedUsername = routeUserId; // Display principal as fallback
      }

      const userDenormalizedShelves = denormalizeShelves(userShelves);
      
      return (
        <UserShelvesUI 
          shelves={userDenormalizedShelves}
          loading={userShelvesLoading || isLoadingRouteUsername} // Combine loading states
          onViewShelf={goToShelf}
          onViewOwner={goToUser} // This likely navigates to a user page, might need username there too
          onBack={goToMainShelves}
          isCurrentUser={isCurrentUserProfile}
          onNewShelf={isCurrentUserProfile ? handleCreateShelf : undefined}
          isCreatingShelf={isCurrentUserProfile ? isCreatingShelf : undefined}
          ownerUsername={displayedUsername} // Pass the resolved or fallback username
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
    </>
  );
};

export default PerpetuaLayout; 