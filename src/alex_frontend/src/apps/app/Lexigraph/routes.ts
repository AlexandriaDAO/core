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

// Parse path information used across multiple components
export const parsePathInfo = (path: string) => {
	const isExplore = path.includes('/explore');
	const isUserView = path.includes('/user/');
	const userId = isUserView ? path.split('/user/')[1].split('/')[0] : null;
	const backButtonLabel = isExplore ? 'Explore' : isUserView ? 'User Shelves' : 'My Library';
	
	return {
		isExplore,
		isUserView,
		userId,
		backButtonLabel
	};
};

// Custom hook for Lexigraph navigation
export const useLexigraphNavigation = () => {
  const navigate = useNavigate();
  const params = useParams<{ shelfId?: string; slotId?: string; userId?: string }>();
  const location = useLocation();
  
  // Determine the current view based on URL path
  const { isMyLibrary, isExplore, isUserView, userId } = useMemo(() => {
    const pathInfo = parsePathInfo(location.pathname);
    return {
      isMyLibrary: !pathInfo.isExplore && !pathInfo.isUserView,
      isExplore: pathInfo.isExplore,
      isUserView: pathInfo.isUserView,
      userId: pathInfo.userId
    };
  }, [location.pathname]);

  // Navigation functions
  const goToShelves = () => {
    if (isExplore) {
      navigate(buildRoutes.explore());
    } else if (isUserView && (userId || params.userId)) {
      navigate(buildRoutes.user(userId || params.userId || ''));
    } else {
      navigate(buildRoutes.myLibrary());
    }
  };

  const goToShelf = (shelfId: string) => {
    if (isExplore) {
      navigate(buildRoutes.exploreShelf(shelfId));
    } else if (isUserView && (userId || params.userId)) {
      navigate(buildRoutes.userShelf(userId || params.userId || '', shelfId));
    } else {
      navigate(buildRoutes.myLibraryShelf(shelfId));
    }
  };

  const goToSlot = (slotId: number) => {
    if (isExplore) {
      navigate(buildRoutes.exploreSlot(slotId));
    } else if (isUserView && (userId || params.userId)) {
      navigate(buildRoutes.userSlot(userId || params.userId || '', slotId));
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

  // Return navigation helpers
  return {
    params,
    isMyLibrary,
    isExplore,
    isUserView,
    userId,
    goToShelves,
    goToShelf,
    goToSlot,
    goToUser,
    switchTab
  };
};

// Custom hook to determine current view based on route params
export const useViewState = () => {
  const { params, isMyLibrary, isExplore, isUserView } = useLexigraphNavigation();
  const { shelfId, slotId, userId } = params;
  
  // Determine if we're showing a detail view
  const isShelfDetail = !!shelfId;
  const isSlotDetail = !!slotId;
  const isUserDetail = !!userId && !shelfId && !slotId;
  
  // Determine if we're showing the main view
  const isMainView = !userId && !shelfId && !slotId;
  
  // Determine if we're in a public context
  const isPublicContext = isExplore || isUserView;
  
  return {
    params: { shelfId, slotId, userId },
    viewFlags: { 
      isMyLibrary, isExplore, isUserView,
      isShelfDetail, isSlotDetail, isUserDetail, isMainView, isPublicContext
    }
  };
}; 