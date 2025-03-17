// Lexigraph route utilities
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { Principal } from "@dfinity/principal";

// Route path constants
export const ROUTES = {
  BASE: '/app/lexigraph',
  MY_LIBRARY: '/app/lexigraph/my-library',
  MY_LIBRARY_SHELF: '/app/lexigraph/my-library/shelf/:shelfId',
  EXPLORE: '/app/lexigraph/explore',
  EXPLORE_SHELF: '/app/lexigraph/explore/shelf/:shelfId',
  USER: '/app/lexigraph/user/:userId',
  USER_SHELF: '/app/lexigraph/user/:userId/shelf/:shelfId',
};

// Route builder functions
export const buildRoutes = {
  myLibrary: () => ROUTES.MY_LIBRARY,
  myLibraryShelf: (shelfId: string) => `/app/lexigraph/my-library/shelf/${shelfId}`,
  explore: () => ROUTES.EXPLORE,
  exploreShelf: (shelfId: string) => `/app/lexigraph/explore/shelf/${shelfId}`,
  user: (userId: string) => `/app/lexigraph/user/${userId}`,
  userShelf: (userId: string, shelfId: string) => `/app/lexigraph/user/${userId}/shelf/${shelfId}`,
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
  const params = useParams<{ shelfId?: string; userId?: string }>();
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
    goToUser,
    switchTab
  };
};

// Custom hook to determine current view based on route params
export const useViewState = () => {
  const { params, isMyLibrary, isExplore, isUserView } = useLexigraphNavigation();
  const { shelfId, userId } = params;
  
  // Determine if we're showing a detail view
  const isShelfDetail = !!shelfId;
  
  // Determine if we're in a public context
  const isUserDetail = !!userId && !shelfId;
  
  // Determine if we're showing the main view
  const isMainView = !userId && !shelfId;
  
  return {
    params: { shelfId, userId },
    viewFlags: { 
      isMyLibrary, isExplore, isUserView,
      isShelfDetail, isUserDetail, isMainView
    }
  };
}; 