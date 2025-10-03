import { useIdentity } from '@/lib/ic-use-identity';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useCallback } from 'react';

/**
 * Hook for checking content permissions based on ownership or public status.
 *
 * This hook provides a convenient way to check if the current user has edit access
 * to a shelf. Access is granted if the user is the owner or if the shelf is public.
 *
 * @returns Object with permission utilities
 */
export const useContentPermissions = () => {
  const { identity } = useIdentity();
  // Direct state access to auth principal - single source of truth
  const currentPrincipal = useAppSelector(state => state.auth.user?.principal);

  // Pre-select all the necessary state data for permission checks
  const shelves = useAppSelector(state => state.perpetua.entities.shelves);
  // Add selector for the public access map
  const publicAccessMap = useAppSelector(state => state.perpetua.publicShelfAccess);

  /**
   * Check if the current user has edit access to the content (shelf).
   * Access is granted if the user is the owner or the shelf is public.
   * This is memoized to avoid recreating the function on each render.
   */
  const checkEditAccess = useCallback((contentId: string): boolean => {
    if (!currentPrincipal) return false; // No user, no access

    const shelf = shelves[contentId];
    if (!shelf) return false; // Shelf not found in state

    // Check 1: Is the user the owner?
    if (shelf.owner === currentPrincipal) return true;

    // Check 2: Is the shelf public?
    // Prioritize the dynamically checked publicAccessMap, fall back to shelf.public_editing from normalized data
    const isPublic = publicAccessMap[contentId] !== undefined
      ? publicAccessMap[contentId]
      : shelf.public_editing; // Use shelf.public_editing as fallback

    return isPublic; // Return true if public

  }, [currentPrincipal, shelves, publicAccessMap]); // Added publicAccessMap dependency

  /**
   * Determine if a user has edit access to a piece of content
   * based on comparing the content owner with the current user
   *
   * @param ownerPrincipal - Principal ID of the content owner
   * @returns boolean indicating if current user is the owner
   */
  const isContentOwner = useCallback((ownerPrincipal: string): boolean => {
    // Keep identity check for robustness, but also check currentPrincipal from state
    if (!currentPrincipal) return false;
    // Use currentPrincipal from Redux state for consistency
    return currentPrincipal === ownerPrincipal;
  }, [currentPrincipal]); // Depend on currentPrincipal from Redux state

  return {
    checkEditAccess,
    isContentOwner,
    currentUser: currentPrincipal
  };
}; 