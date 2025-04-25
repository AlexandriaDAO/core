import { useIdentity } from '@/hooks/useIdentity';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useCallback } from 'react';
import { 
  setContentPermission
} from '@/apps/app/Perpetua/state/perpetuaSlice';

/**
 * Hook for managing content permissions
 * 
 * This hook provides a convenient way to check if the current user has edit access
 * to a particular piece of content. It provides methods to check permissions
 * based on direct state access to auth information.
 *
 * @returns Object with permission utilities
 */
export const useContentPermissions = () => {
  const dispatch = useAppDispatch();
  const { identity } = useIdentity();
  // Direct state access to auth principal - single source of truth
  const currentPrincipal = useAppSelector(state => state.auth.user?.principal);
  
  // Pre-select all the necessary state data for permission checks
  const shelves = useAppSelector(state => state.perpetua.entities.shelves);
  const shelfEditors = useAppSelector(state => state.perpetua.shelfEditors);
  
  /**
   * Check if the current user has edit access to the content
   * This is memoized to avoid recreating the function on each render
   */
  const checkEditAccess = useCallback((contentId: string) => {
    if (!currentPrincipal) return false;
    
    const shelf = shelves[contentId];
    if (!shelf) return false;
    
    // Check if user is owner
    if (shelf.owner === currentPrincipal) return true;
    
    // Check if user is editor
    const editors = shelfEditors[contentId] || [];
    return editors.includes(currentPrincipal);
  }, [currentPrincipal, shelves, shelfEditors]);
  
  /**
   * Manually set a permission for a specific content ID
   * @param contentId - ID of the content
   * @param hasAccess - Whether the user has edit access
   */
  const setEditAccess = useCallback((contentId: string, hasAccess: boolean) => {
    dispatch(setContentPermission({ contentId, hasEditAccess: hasAccess }));
  }, [dispatch]);
  
  /**
   * Determine if a user has edit access to a piece of content
   * based on comparing the content owner with the current user
   * 
   * @param ownerPrincipal - Principal ID of the content owner
   * @returns boolean indicating if current user is the owner
   */
  const isContentOwner = useCallback((ownerPrincipal: string) => {
    if (!identity) return false;
    const currentPrincipalStr = identity.getPrincipal().toString();
    return currentPrincipalStr === ownerPrincipal;
  }, [identity]);
  
  return {
    checkEditAccess,
    setEditAccess,
    isContentOwner,
    currentUser: currentPrincipal
  };
}; 