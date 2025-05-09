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
  selectIsCreatingShelf,
  setCurrentFeedType,
  selectCurrentFeedType,
  selectRandomFeedShelves,
  selectStorylineFeedShelves,
  selectRandomFeedLoading,
  selectStorylineFeedLoading,
  selectStorylineFeedCursor,
  selectPublicShelves,
  selectUserShelves,
  selectPublicLoading,
  selectLoading
} from "@/apps/app/Perpetua/state/perpetuaSlice";
import { 
  loadRecentShelves, 
  loadRandomFeed, 
  loadStorylineFeed 
} from "@/apps/app/Perpetua/state/thunks/queryThunks";
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
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";

// Import Tag components
import { PopularTagsList } from '../features/tags/components/PopularTagsList';
import { TagSearchBar } from '../features/tags/components/TagSearchBar';
import { TagFilterDisplay } from '../features/tags/components/TagFilterDisplay';
import { FilteredShelfListContainer } from '../features/tags/containers/FilteredShelfListContainer';

// Import Following components
import { FollowedTagsList } from '../features/following/components/FollowedTagsList';
import { FollowedUsersList } from '../features/following/components/FollowedUsersList';

// Import thunks for dispatching
import { loadMyFollowedTags } from '../state/thunks/followThunks';

// Feed type definition
type FeedType = 'recency' | 'random' | 'storyline';

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
  
  // Feed specific state
  const currentFeedType = useAppSelector(selectCurrentFeedType);
  const randomFeedShelves = useAppSelector(selectRandomFeedShelves) as NormalizedShelf[]; // Type assertion
  const storylineFeedShelves = useAppSelector(selectStorylineFeedShelves) as NormalizedShelf[]; // Type assertion
  const storylineFeedCursor = useAppSelector(selectStorylineFeedCursor);
  const recencyPublicShelves = useAppSelector(selectPublicShelves) as NormalizedShelf[]; // Type assertion
  const recencyUserShelves = useAppSelector(selectUserShelves) as NormalizedShelf[]; // Type assertion

  // Loading states for feeds
  const isLoadingRecencyPublic = useAppSelector(selectPublicLoading);
  const isLoadingRecencyUser = useAppSelector(selectLoading);
  const isLoadingRandomFeed = useAppSelector(selectRandomFeedLoading);
  const isLoadingStorylineFeed = useAppSelector(selectStorylineFeedLoading);
  
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
  const userShelves = useAppSelector(state => userShelvesSelector ? userShelvesSelector(state) : stableEmptyShelves) as NormalizedShelf[]; // Type assertion
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
      
      // Load the current user's followed tags
      dispatch(loadMyFollowedTags());
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
  
  // Effect to load initial feed data when feed type changes
  useEffect(() => {
    if (currentFeedType === 'random' && randomFeedShelves.length === 0 && !isLoadingRandomFeed) {
      dispatch(loadRandomFeed({ limit: 20 })); // Default limit, adjust as needed
    } else if (currentFeedType === 'storyline' && storylineFeedShelves.length === 0 && !isLoadingStorylineFeed && identity) {
      // For storyline, ensure identity is available as it might be needed for personalization,
      // even if not directly passed to the current thunk, it's good practice for feed thunks.
      // The current loadStorylineFeed thunk doesn't require principal in its direct args,
      // but future versions or the service might.
      dispatch(loadStorylineFeed({ params: { limit: 20 } })); // Initial load, no cursor
    } else if (currentFeedType === 'recency' && recencyPublicShelves.length === 0 && !isLoadingRecencyPublic ) {
      // Initial load for recency feed if it's empty and not already loading.
      // This assumes loadRecentShelves populates recencyPublicShelves.
      dispatch(loadRecentShelves({ limit: 20 })); // Corrected: pass params directly
    }
  }, [
    currentFeedType, 
    dispatch, 
    randomFeedShelves.length, 
    storylineFeedShelves.length, 
    identity, 
    recencyPublicShelves.length, 
    // Removed isLoadingRecencyPublic, isLoadingRandomFeed, isLoadingStorylineFeed from dependencies to prevent loops on error
    // The conditions inside the effect already check these loading states before dispatching.
  ]);
  
  // Action handlers
  const handleCreateShelf = useCallback(() => setIsNewShelfDialogOpen(true), []);
  
  const handleNewShelfSubmit = useCallback(async (title: string, description: string) => {
    await createShelf(title, description);
    setIsNewShelfDialogOpen(false);
  }, [createShelf]);
  
  const handleFeedTypeChange = (value: string) => {
    if (value) { // ToggleGroup might pass empty string if nothing is active, ensure value exists
        dispatch(setCurrentFeedType(value as FeedType));
    }
  };

  const loadMoreStoryline = useCallback(async () => { // Make async for UnifiedShelvesUI
    if (identity && storylineFeedCursor && !isLoadingStorylineFeed) {
      await dispatch(loadStorylineFeed({ params: { limit: 20, cursor: storylineFeedCursor }})).unwrap();
    }
  }, [dispatch, identity, storylineFeedCursor, isLoadingStorylineFeed]);

  // Combine shelves for Recency feed view
  const recencyCombinedNormalizedShelves = useMemo(() => {
    if (currentFeedType !== 'recency') return [];
    const seenShelfIds = new Set<string>();
    const uniqueShelves: NormalizedShelf[] = [];
    [...(recencyUserShelves || []), ...(recencyPublicShelves || [])].forEach((shelf: NormalizedShelf) => {
      if (shelf && shelf.shelf_id && !seenShelfIds.has(shelf.shelf_id)) {
        seenShelfIds.add(shelf.shelf_id);
        uniqueShelves.push(shelf);
      }
    });
    return uniqueShelves;
  }, [currentFeedType, recencyUserShelves, recencyPublicShelves]);

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
      let shelvesToDisplay: NormalizedShelf[] = [];
      let isLoadingCurrentFeed = false;
      let loadMoreAction: (() => Promise<void>) | undefined = undefined;

      if (currentFeedType === 'recency') {
        shelvesToDisplay = recencyPublicShelves || [];
        isLoadingCurrentFeed = isLoadingRecencyPublic;
        loadMoreAction = loadMoreShelves;
      } else if (currentFeedType === 'random') {
        shelvesToDisplay = randomFeedShelves || []; // Ensure array
        isLoadingCurrentFeed = isLoadingRandomFeed;
      } else if (currentFeedType === 'storyline') {
        shelvesToDisplay = storylineFeedShelves || []; // Ensure array
        isLoadingCurrentFeed = isLoadingStorylineFeed;
        loadMoreAction = storylineFeedCursor ? loadMoreStoryline : undefined; 
      }

      return (
        <>
          {userPrincipal && (
            <div className="mb-4 flex justify-between items-center">
              <Button onClick={() => goToUser(userPrincipal.toString())}>My Library</Button>
              <ToggleGroup type="single" defaultValue={currentFeedType} value={currentFeedType} onValueChange={handleFeedTypeChange} className="w-auto">
                <ToggleGroupItem value="recency">Recent</ToggleGroupItem>
                <ToggleGroupItem value="random">Random</ToggleGroupItem>
                <ToggleGroupItem value="storyline">Storyline</ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
          {!userPrincipal && (
             <div className="mb-4 flex justify-end items-center">
              <ToggleGroup type="single" defaultValue={currentFeedType} value={currentFeedType} onValueChange={handleFeedTypeChange} className="w-auto">
                <ToggleGroupItem value="recency">Recent</ToggleGroupItem>
                <ToggleGroupItem value="random">Random</ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start">
            <div className="flex-grow"><PopularTagsList /></div>
            <TagSearchBar />
          </div>
          <FollowedTagsList />
          <FollowedUsersList />
          <TagFilterDisplay />

          {currentTagFilter ? (
            <FilteredShelfListContainer /> 
          ) : (
            <UnifiedShelvesUI 
              allShelves={denormalizeShelves(shelvesToDisplay)}
              personalShelves={denormalizeShelves(personalNormalizedShelves)}
              loading={isLoadingCurrentFeed}
              onNewShelf={handleCreateShelf}
              onViewShelf={goToShelf}
              onViewOwner={goToUser}
              onLoadMore={loadMoreAction ? loadMoreAction : async () => {}}
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