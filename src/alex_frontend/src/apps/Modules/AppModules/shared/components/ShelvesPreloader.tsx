import React, { useEffect, useState } from 'react';
import { useIdentity } from '@/hooks/useIdentity';
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { selectLoading, selectUserShelves } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { loadShelves } from '@/apps/app/Perpetua/state';
import { usePerpetua } from '@/hooks/actors';

/**
 * Preloads shelves data as soon as the app loads and identity is available.
 * This ensures shelves are ready when components needing shelf data (like UnifiedCardActions) mount.
 */
export const ShelvesPreloader: React.FC = () => {
  const {actor} = usePerpetua();
  const dispatch = useAppDispatch();
  const { identity } = useIdentity();
  const shelvesLoading = useAppSelector(selectLoading);
  const availableShelves = useAppSelector(selectUserShelves);
  const hasLoadedShelves = availableShelves.length > 0;

  // State to track if the initial load attempt has been made for the current identity
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    // Reset attempt flag if identity changes (e.g., user logs out and logs in)
    if (identity) {
        setHasAttemptedLoad(false);
    }
  }, [identity]);

  useEffect(() => {
    // Load shelves only if:
    // 1. Identity exists
    // 2. Not currently loading
    // 3. Shelves haven't been successfully loaded yet
    // 4. Haven't already attempted to load for this identity session
    if (actor && identity && !shelvesLoading && !hasLoadedShelves && !hasAttemptedLoad) {
      setHasAttemptedLoad(true); // Mark that we've started the attempt
      dispatch(loadShelves({
        actor,
        principal: identity.getPrincipal(),
        params: { offset: 0, limit: 50 } // Load a reasonable number initially
      }));
    }
  }, [identity,actor, dispatch, shelvesLoading, hasLoadedShelves, hasAttemptedLoad]);

  // This component doesn't render anything visible
  return null;
}; 