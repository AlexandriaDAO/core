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
import { useIdentity } from "@/lib/ic-use-identity";
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
import { LoaderCircle, Library, Plus, Users, Filter, FilterX } from "lucide-react";

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
import { usePerpetua } from "@/hooks/actors";

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

  const {actor} = usePerpetua();

  // Core data hooks
  const { shelves: personalNormalizedShelves, loading: personalLoading, createShelf, addItem, setItemOrder } = useShelfOperations();
  const { publicShelves: publicNormalizedShelves, loading: publicShelvesHookLoading, loadMoreShelves } = usePublicShelfOperations(); // Renamed publicLoading to avoid conflict
  
  // Dialog state
  const [isNewShelfDialogOpen, setIsNewShelfDialogOpen] = useState(false);
  const [isFollowingSectionVisible, setIsFollowingSectionVisible] = useState(false);
  const [isSearchSectionVisible, setIsSearchSectionVisible] = useState(false); // New state for search expander
  
  // Redux state
  const dispatch = useAppDispatch();
  const selectedShelf = useAppSelector(selectSelectedShelf);
  const currentSelectedShelfId = useAppSelector(state => state.perpetua.selectedShelfId); // Direct access for comparison
  const authUser = useAppSelector(state => state.auth.user);
  const { identity } = useIdentity();
  const userPrincipal = identity?.getPrincipal().toString();
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
  
  // Memoize the denormalized selected shelf
  const denormalizedSelectedShelf = useMemo(() => {
    if (selectedShelf) {
      return denormalizeShelf(selectedShelf);
    }
    return null;
  }, [selectedShelf]);
  
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
  const [userShelvesLoadingState, setUserShelvesLoadingState] = useState(false);
  
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
    if(!actor) return;
    if (identity) {
      // Load the current user's shelves as soon as the layout mounts
      dispatch(loadShelves({ 
        actor,
        principal: identity.getPrincipal(), 
        params: { offset: 0, limit: 20 }
      }))
        .unwrap()
        .catch((error) => {
          console.error("Failed to load shelves:", error);
        });
    }
  }, [identity, actor, dispatch]);
  
  // Load shelves when viewing a specific user's profile (modified to prevent loops)
  useEffect(() => {
    if(!actor) return;
    if (isUserDetail && routeUserId && routeUserId !== userPrincipal && !userShelvesLoadingState) {
      setUserShelvesLoadingState(true);
      // Dispatch loadShelves and let Redux handle state management
      dispatch(loadShelves({ 
        actor,
        principal: routeUserId, 
        params: { offset: 0, limit: 20 }
      }))
        .unwrap()
        .then(() => {
          setUserShelvesLoadingState(false);
        })
        .catch(() => {
          setUserShelvesLoadingState(false);
        });
    }
  }, [dispatch, actor, isUserDetail, routeUserId, userPrincipal, userShelvesLoadingState]);
  
  // Handle shelf selection when route changes - simplified dependencies
  useEffect(() => {
    if (shelfId && shelfId !== currentSelectedShelfId) {
      // Only dispatch if the route shelfId is different from the current state
      dispatch(setSelectedShelf(shelfId));
    }
  }, [shelfId, currentSelectedShelfId, dispatch]); // Depends only on IDs and dispatch
  
  // Effect to load initial feed data when feed type changes
  useEffect(() => {
    if(!actor) return;

    if (currentFeedType === 'storyline' && storylineFeedShelves.length === 0 && !isLoadingStorylineFeed && identity) {
      dispatch(loadStorylineFeed({ actor,params: { limit: 20 } })); 
    } else if (currentFeedType === 'recency' && recencyPublicShelves.length === 0 && !isLoadingRecencyPublic ) {
      dispatch(loadRecentShelves({ actor, params: { limit: 20 } })); 
    }
  }, [
    actor,
    currentFeedType, 
    dispatch, 
    storylineFeedShelves.length, 
    identity, 
    recencyPublicShelves.length, 
    isLoadingRecencyPublic,
    isLoadingStorylineFeed
  ]);
  
  // Action handlers
  const handleCreateShelf = useCallback(() => setIsNewShelfDialogOpen(true), []);
  
  const handleNewShelfSubmit = useCallback(async (title: string, description: string) => {
    await createShelf(title, description);
    setIsNewShelfDialogOpen(false);
  }, [createShelf]);
  
  const handleFeedTypeChange = (value: string) => {
    if(!actor) return;
    if (value) { 
        const newFeedType = value as FeedType;
        dispatch(setCurrentFeedType(newFeedType));
        if (newFeedType === 'random') {
          dispatch(loadRandomFeed({ actor, limit: 20 })); 
        }
    }
  };

  const loadMoreStoryline = useCallback(async () => { 
    if(!actor) return;
    if (identity && !isLoadingStorylineFeed) { 
      if (storylineFeedCursor) { 
        await dispatch(loadStorylineFeed({ actor, params: { limit: 20, cursor: storylineFeedCursor }})).unwrap();
      } else { 
        await dispatch(loadStorylineFeed({ actor, params: { limit: 20, cursor: undefined }})).unwrap();
      }
    }
  }, [dispatch,actor, identity, storylineFeedCursor, isLoadingStorylineFeed]);

  const loadMoreRandom = useCallback(async () => {
    if(!actor) return;
    if (!isLoadingRandomFeed) {
      await dispatch(loadRandomFeed({ actor, limit: 20 }));
    }
  }, [dispatch, actor, isLoadingRandomFeed]);

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
    if (isShelfDetail && denormalizedSelectedShelf) {
      return (
        <ShelfDetailContainer
          shelf={denormalizedSelectedShelf}
          onBack={goToShelves}
        />
      );
    }
    
    if (isMainView) {
      let shelvesToDisplay: NormalizedShelf[] = [];
      let isLoadingCurrentFeed = false;
      let loadMoreAction: (() => Promise<void>) | undefined = undefined;

      if (currentFeedType === 'recency') {
        shelvesToDisplay = recencyPublicShelves || [];
        isLoadingCurrentFeed = isLoadingRecencyPublic;
        loadMoreAction = loadMoreShelves;
      } else if (currentFeedType === 'random') {
        shelvesToDisplay = randomFeedShelves || []; 
        isLoadingCurrentFeed = isLoadingRandomFeed;
        loadMoreAction = loadMoreRandom; 
      } else if (currentFeedType === 'storyline') {
        shelvesToDisplay = storylineFeedShelves || []; 
        isLoadingCurrentFeed = isLoadingStorylineFeed;
        loadMoreAction = loadMoreStoryline; 
      }

      return (
        <>
          {/* Top controls: Feed Toggles first, then Action Buttons & Search Expander */}
          <div className="mb-4 flex flex-col items-center gap-3"> {/* Reduced gap slightly */}
            {/* Feed Toggles - Centered */}
            <div className="flex justify-center w-full sm:w-auto">
              <ToggleGroup 
                type="single" 
                defaultValue={currentFeedType} 
                value={currentFeedType} 
                onValueChange={handleFeedTypeChange} 
                className="w-auto flex-shrink-0 border border-border rounded-md p-0.5"
              >
                <ToggleGroupItem value="recency" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent rounded-sm px-3 py-1 text-sm">Recent</ToggleGroupItem>
                <ToggleGroupItem value="random" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent rounded-sm px-3 py-1 text-sm">Random</ToggleGroupItem>
                {userPrincipal && <ToggleGroupItem value="storyline" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent rounded-sm px-3 py-1 text-sm">Storyline</ToggleGroupItem>}
              </ToggleGroup>
            </div>

            {/* Action Buttons & Search Expander - Below feeds, centered */}
            <div className="flex items-center gap-2 flex-wrap justify-center w-full">
              {userPrincipal && (
                <Button 
                  onClick={() => goToUser(userPrincipal)} 
                  className="whitespace-nowrap" 
                  variant="primary" 
                  scale="sm"
                >
                  <Library className="mr-2 h-4 w-4" />
                  My Library
                </Button>
              )}
              {userPrincipal && (
                <Button 
                  onClick={handleCreateShelf} 
                  className="whitespace-nowrap"
                  disabled={isCreatingShelf} 
                  variant="primary" 
                  scale="sm"
                >
                  {isCreatingShelf ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  New Shelf
                </Button>
              )}
              {userPrincipal && (
                <Button 
                  onClick={() => setIsFollowingSectionVisible(!isFollowingSectionVisible)}
                  className="whitespace-nowrap"
                  variant={isFollowingSectionVisible ? "secondary" : "primary"} // Corrected: No "default", uses primary/secondary
                  scale="sm"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Following
                </Button>
              )}
              <Button 
                onClick={() => setIsSearchSectionVisible(!isSearchSectionVisible)}
                className="whitespace-nowrap"
                variant={isSearchSectionVisible ? "secondary" : "primary"} // Corrected: No "default", uses primary/secondary
                scale="sm"
              >
                {isSearchSectionVisible ? <FilterX className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
                {isSearchSectionVisible ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>
          
          {/* Conditionally rendered Tags and Search Section */}
          {isSearchSectionVisible && (
            <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-grow w-full md:w-auto">
                <PopularTagsList /> 
              </div>
              <div className="w-full md:w-auto md:min-w-[250px] flex-shrink-0">
                <TagSearchBar />
              </div>
            </div>
          )}
          
          {/* Following Section (conditionally rendered) */}
          {identity && isFollowingSectionVisible && (
            <div className="mb-6 flex flex-col gap-6 border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold">Following</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FollowedTagsList />
                <FollowedUsersList />
              </div>
            </div>
          )}
          
          {/* Tag Filter Display - show if search is open OR a filter is active */}
          {(isSearchSectionVisible || currentTagFilter) && <TagFilterDisplay />}


          {currentTagFilter && isSearchSectionVisible ? ( // If a filter is applied AND search is open, show filtered list
            <FilteredShelfListContainer /> 
          ) : currentTagFilter && !isSearchSectionVisible ? ( // If a filter is applied BUT search is closed, still show filtered list
             <FilteredShelfListContainer /> 
          ) : ( // Otherwise, show the normal feed
            <UnifiedShelvesUI 
              displayTitle=""
              allShelves={denormalizeShelves(shelvesToDisplay)}
              personalShelves={denormalizeShelves(personalNormalizedShelves)}
              loading={isLoadingCurrentFeed}
              onNewShelf={() => {}}
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
    
    if (isUserDetail && routeUserId) {
      const isCurrentUserProfile = userPrincipal === routeUserId;
      
      let displayedUsername: string | undefined = undefined;
      if (isCurrentUserProfile && authUser && typeof (authUser as any).username === 'string') {
        displayedUsername = (authUser as any).username;
      } else if (routeUsername) {
        displayedUsername = routeUsername;
      } else if (isLoadingRouteUsername) {
        displayedUsername = `Loading user...`; 
      } else {
        displayedUsername = routeUserId; 
      }

      const userDenormalizedShelves = denormalizeShelves(userShelves);
      
      return (
        <UserShelvesUI 
          shelves={userDenormalizedShelves}
          loading={userShelvesLoadingState || isLoadingRouteUsername} // Corrected variable name
          onViewShelf={goToShelf}
          onViewOwner={goToUser} 
          onBack={goToMainShelves}
          isCurrentUser={isCurrentUserProfile}
          onNewShelf={isCurrentUserProfile ? handleCreateShelf : undefined}
          isCreatingShelf={isCurrentUserProfile ? isCreatingShelf : undefined}
          ownerUsername={displayedUsername} 
        />
      );
    }
    
    return <div>Loading...</div>;
  };
  
  return (
    <>
      {isShelfDetail && selectedShelf ? (
        renderView()
      ) : (
        <div className="container mx-auto p-4">
          {renderView()}
        </div>
      )}
      
      {identity && (
        <NewShelfDialog 
          isOpen={isNewShelfDialogOpen}
          onClose={() => setIsNewShelfDialogOpen(false)}
          onSubmit={handleNewShelfSubmit}
        />
      )}
    </>
  );
};

export default PerpetuaLayout; 