import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  selectUserShelves,
  selectPublicShelves,
  selectShelfById,
  selectSelectedShelf,
  selectLastTimestamp,
  selectLoading,
  selectPublicLoading,
  selectError,
  selectIsOwner,
} from '../perpetuaSlice';

/**
 * Custom hooks for accessing Perpetua state in React components.
 * These hooks wrap the Redux selectors for a more convenient API.
 */

// Get user's shelves
export const useUserShelves = () => useSelector(selectUserShelves);

// Get public shelves
export const usePublicShelves = () => useSelector(selectPublicShelves);

// Get a specific shelf by ID
export const useShelfById = (shelfId: string) => 
  useSelector(selectShelfById(shelfId));

// Get the currently selected shelf
export const useSelectedShelf = () => useSelector(selectSelectedShelf);

// Get the last timestamp (for pagination)
export const useLastTimestamp = () => useSelector(selectLastTimestamp);

// Loading states
export const useLoadingState = () => useSelector(selectLoading);
export const usePublicLoadingState = () => useSelector(selectPublicLoading);

// Error state
export const useError = () => useSelector(selectError);

// Direct access to user principal from auth state - single source of truth
export const useUserPrincipal = () => useSelector((state: RootState) => state.auth.user?.principal);

// Permission checks
export const useIsOwner = (contentId: string) => 
  useSelector((state: RootState) => selectIsOwner(contentId)(state));