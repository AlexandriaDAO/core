// Lexigraph route utilities
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { Principal } from "@dfinity/principal";

// Route path constants
export const ROUTES = {
  BASE: '/app/lexigraph',
  MY_LIBRARY: '/app/lexigraph/my-library',
  MY_LIBRARY_SHELF: '/app/lexigraph/my-library/shelf/:shelfId',
  MY_LIBRARY_SLOT: '/app/lexigraph/my-library/slot/:slotId',
  EXPLORE: '/app/lexigraph/explore',
  EXPLORE_SHELF: '/app/lexigraph/explore/shelf/:shelfId',
  EXPLORE_SLOT: '/app/lexigraph/explore/slot/:slotId',
  USER: '/app/lexigraph/user/:userId',
  USER_SHELF: '/app/lexigraph/user/:userId/shelf/:shelfId',
  USER_SLOT: '/app/lexigraph/user/:userId/slot/:slotId',
};

// Route builder functions
export const buildRoutes = {
  myLibrary: () => ROUTES.MY_LIBRARY,
  myLibraryShelf: (shelfId: string) => `/app/lexigraph/my-library/shelf/${shelfId}`,
  myLibrarySlot: (slotId: number) => `/app/lexigraph/my-library/slot/${slotId}`,
  explore: () => ROUTES.EXPLORE,
  exploreShelf: (shelfId: string) => `/app/lexigraph/explore/shelf/${shelfId}`,
  exploreSlot: (slotId: number) => `/app/lexigraph/explore/slot/${slotId}`,
  user: (userId: string) => `/app/lexigraph/user/${userId}`,
  userShelf: (userId: string, shelfId: string) => `/app/lexigraph/user/${userId}/shelf/${shelfId}`,
  userSlot: (userId: string, slotId: number) => `/app/lexigraph/user/${userId}/slot/${slotId}`,
};

// Custom hook for Lexigraph navigation
export const useLexigraphNavigation = () => {
  const navigate = useNavigate();
  const params = useParams<{ shelfId?: string; slotId?: string; userId?: string }>();
  const location = useLocation();
  
  // Determine the current view based on URL path
  const { isMyLibrary, isExplore, isUserView } = useMemo(() => {
    const path = location.pathname;
    return {
      isMyLibrary: path.includes('/my-library'),
      isExplore: path.includes('/explore'),
      isUserView: path.includes('/user/'),
    };
  }, [location.pathname]);

  // Navigation functions
  const goToShelves = () => {
    if (isExplore) {
      navigate(buildRoutes.explore());
    } else if (isUserView && params.userId) {
      navigate(buildRoutes.user(params.userId));
    } else {
      navigate(buildRoutes.myLibrary());
    }
  };

  const goToShelf = (shelfId: string) => {
    if (isExplore) {
      navigate(buildRoutes.exploreShelf(shelfId));
    } else if (isUserView && params.userId) {
      navigate(buildRoutes.userShelf(params.userId, shelfId));
    } else {
      navigate(buildRoutes.myLibraryShelf(shelfId));
    }
  };

  const goToSlot = (slotId: number) => {
    if (isExplore) {
      navigate(buildRoutes.exploreSlot(slotId));
    } else if (isUserView && params.userId) {
      navigate(buildRoutes.userSlot(params.userId, slotId));
    } else {
      navigate(buildRoutes.myLibrarySlot(slotId));
    }
  };

  const goToUser = (userId: string | Principal) => {
    const userIdString = userId.toString();
    navigate(buildRoutes.user(userIdString));
  };

  const switchTab = (tab: string) => {
    if (tab === "explore") {
      navigate(buildRoutes.explore());
    } else {
      navigate(buildRoutes.myLibrary());
    }
  };

  return {
    params,
    isMyLibrary,
    isExplore,
    isUserView,
    goToShelves,
    goToShelf,
    goToSlot,
    goToUser,
    switchTab
  };
}; 