import React, { useEffect } from 'react';
import { useIdentity } from '@/hooks/useIdentity';
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch"; // Assuming useAppDispatch is correctly set up
import { selectLoading, selectUserShelves } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { loadShelves } from '@/apps/app/Perpetua/state';

/**
 * Preloads shelves data as soon as the app loads and identity is available.
 * This ensures shelves are ready when components needing shelf data (like UnifiedCardActions) mount.
 */
export const ShelvesPreloader: React.FC = () => {
  const dispatch = useAppDispatch();
  const { identity } = useIdentity();
  const shelvesLoading = useAppSelector(selectLoading);
  const availableShelves = useAppSelector(selectUserShelves);

  useEffect(() => {
    // Load shelves only if identity exists, shelves aren't already loading, and no shelves are currently loaded
    if (identity && !shelvesLoading && availableShelves.length === 0) {
      console.log('[ShelvesPreloader] Triggering shelf load...');
      dispatch(loadShelves({
        principal: identity.getPrincipal(),
        params: { offset: 0, limit: 20 } // Consider making limit configurable or higher if needed
      }));
    }
  }, [identity, dispatch, shelvesLoading, availableShelves]);

  // This component doesn't render anything visible
  return null;
}; 