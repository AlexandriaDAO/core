import { useEffect } from 'react';
import { useIdentity } from '@/hooks/useIdentity';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { 
  selectHasEditAccess, 
  selectUserPrincipal, 
  setUserPrincipal,
  setContentPermission
} from '@/apps/Modules/shared/state/perpetua/perpetuaSlice';

/**
 * Hook for managing content permissions
 * 
 * This hook provides a convenient way to check if the current user has edit access
 * to a particular piece of content. It initializes the user principal in Redux
 * state and provides methods to check and modify permissions.
 * 
 * @returns Object with permission utilities
 */
export const useContentPermissions = () => {
  const dispatch = useAppDispatch();
  const { identity } = useIdentity();
  const currentPrincipal = useAppSelector(selectUserPrincipal);
  const permissions = useAppSelector(state => state.perpetua.permissions);
  
  // Set the user principal in redux state when identity changes
  useEffect(() => {
    const principalString = identity?.getPrincipal().toString() || null;
    
    if (principalString !== currentPrincipal) {
      dispatch(setUserPrincipal(principalString));
    }
  }, [identity, currentPrincipal, dispatch]);
  
  /**
   * Check if the current user has edit access to the content
   * @param contentId - ID of the content to check
   * @returns boolean indicating if user has edit access
   */
  const checkEditAccess = (contentId: string) => {
    return permissions[contentId] || false;
  };
  
  /**
   * Manually set a permission for a specific content ID
   * @param contentId - ID of the content
   * @param hasAccess - Whether the user has edit access
   */
  const setEditAccess = (contentId: string, hasAccess: boolean) => {
    dispatch(setContentPermission({ contentId, hasEditAccess: hasAccess }));
  };
  
  /**
   * Determine if a user has edit access to a piece of content
   * based on comparing the content owner with the current user
   * 
   * @param ownerPrincipal - Principal ID of the content owner
   * @returns boolean indicating if current user is the owner
   */
  const isContentOwner = (ownerPrincipal: string) => {
    if (!identity) return false;
    const currentPrincipal = identity.getPrincipal().toString();
    return currentPrincipal === ownerPrincipal;
  };
  
  return {
    checkEditAccess,
    setEditAccess,
    isContentOwner,
    currentUser: currentPrincipal
  };
}; 