// Perpetua route utilities
import { useNavigate, useLocation, useMatch } from "@tanstack/react-router";
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
  const location = useLocation();

  const shelfMatch = useMatch({
    from: '/app/perpetua/shelf/$shelfId',
    shouldThrow: false,
  });
  const userMatch = useMatch({
    from: '/app/perpetua/user/$userId/',
    shouldThrow: false,
  });
  const userShelfMatch = useMatch({
    from: '/app/perpetua/user/$userId/shelf/$shelfId',
    shouldThrow: false,
  });
  const userItemMatch = useMatch({
    from: '/app/perpetua/user/$userId/item/$itemId',
    shouldThrow: false,
  });

  const params: { shelfId?: string; userId?: string; } = useMemo(() => {
    if (shelfMatch) return { shelfId: shelfMatch.params.shelfId };
    if (userMatch) return { userId: userMatch.params.userId };
    if (userShelfMatch) return { userId: userShelfMatch.params.userId, shelfId: userShelfMatch.params.shelfId };
    if (userItemMatch) return { userId: userItemMatch.params.userId };
    return {};
  }, [shelfMatch, userMatch, userShelfMatch, userItemMatch]);

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
      navigate({to: buildRoutes.user(userId || params.userId || '')});
    } else {
      navigate({to: buildRoutes.home()});
    }
  };

  const goToShelf = (shelfId: string) => {
    if (isUserView && (userId || params.userId)) {
      navigate({to: buildRoutes.userShelf(userId || params.userId || '', shelfId)});
    } else {
      navigate({to: buildRoutes.shelf(shelfId)});
    }
  };

  const goToUser = (userId: string | Principal) => {
    const userIdString = userId.toString();
    navigate({to: buildRoutes.user(userIdString)});
  };
  
  const goToMainShelves = () => {
    navigate({to: buildRoutes.home()});
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