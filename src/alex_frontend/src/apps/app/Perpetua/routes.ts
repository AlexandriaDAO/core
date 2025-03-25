// Perpetua route utilities
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { Principal } from "@dfinity/principal";

// Route path constants
export const ROUTES = {
  BASE: '/app/perpetua',
  SHELF: '/app/perpetua/shelf/:shelfId',
  ITEM: '/app/perpetua/item/:itemId',
  USER: '/app/perpetua/user/:userId',
  USER_SHELF: '/app/perpetua/user/:userId/shelf/:shelfId',
  USER_ITEM: '/app/perpetua/user/:userId/item/:itemId',
};

// Route builder functions
export const buildRoutes = {
  home: () => ROUTES.BASE,
  shelf: (shelfId: string) => `/app/perpetua/shelf/${shelfId}`,
  item: (itemId: string) => `/app/perpetua/item/${itemId}`,
  user: (userId: string) => `/app/perpetua/user/${userId}`,
  userShelf: (userId: string, shelfId: string) => `/app/perpetua/user/${userId}/shelf/${shelfId}`,
  userItem: (userId: string, itemId: string) => `/app/perpetua/user/${userId}/item/${itemId}`,
};

// Parse path information used across multiple components
export const parsePathInfo = (path: string) => {
	const isUserView = path.includes('/user/');
	const userId = isUserView ? path.split('/user/')[1].split('/')[0] : null;
	
	// Set appropriate breadcrumb/back label based on path context
  const backButtonLabel = isUserView ? 'User Shelves' : 'Shelves';
  const backPath = isUserView && userId ? buildRoutes.user(userId) : buildRoutes.home();
	
	return {
		isUserView,
		userId,
		backButtonLabel,
    backPath
	};
};

// Custom hook for Perpetua navigation
export const usePerpetuaNavigation = () => {
  const navigate = useNavigate();
  const params = useParams<{ shelfId?: string; userId?: string }>();
  const location = useLocation();
  
  // Determine the current view based on URL path
  const { isUserView, userId, backPath } = useMemo(() => {
    const pathInfo = parsePathInfo(location.pathname);
    return {
      isUserView: pathInfo.isUserView,
      userId: pathInfo.userId,
      backPath: pathInfo.backPath
    };
  }, [location.pathname]);

  // Navigation functions
  const goToShelves = () => {
    if (isUserView && (userId || params.userId)) {
      navigate(buildRoutes.user(userId || params.userId || ''));
    } else {
      navigate(buildRoutes.home());
    }
  };

  const goToShelf = (shelfId: string) => {
    if (isUserView && (userId || params.userId)) {
      navigate(buildRoutes.userShelf(userId || params.userId || '', shelfId));
    } else {
      navigate(buildRoutes.shelf(shelfId));
    }
  };

  const goToUser = (userId: string | Principal) => {
    const userIdString = userId.toString();
    navigate(buildRoutes.user(userIdString));
  };
  
  const goToMainShelves = () => {
    navigate(buildRoutes.home());
  };

  // Return navigation helpers
  return {
    params,
    isUserView,
    userId,
    backPath,
    goToShelves,
    goToShelf,
    goToUser,
    goToMainShelves
  };
};

// Custom hook to determine current view based on route params
export const useViewState = () => {
  const { params, isUserView } = usePerpetuaNavigation();
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
      isUserView,
      isShelfDetail, isUserDetail, isMainView
    }
  };
}; 