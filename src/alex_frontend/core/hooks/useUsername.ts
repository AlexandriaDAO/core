import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store'; // Adjust path as necessary
import { fetchUsername } from '@/store/slices/userDisplaySlice'; // Adjust path as necessary
import { Principal } from '@dfinity/principal';

interface UseUsernameResult {
  username: string | null;
  isLoading: boolean;
  principal: string | null;
  error?: string;
}

export const useUsername = (principalInput: string | Principal | null | undefined): UseUsernameResult => {
  const dispatch = useDispatch<AppDispatch>();
  const principalString = principalInput ? principalInput.toString() : null;

  const userInfo = useSelector((state: RootState) => 
    principalString ? state.userDisplay.users[principalString] : undefined
  );

  useEffect(() => {
    if (principalString && (!userInfo || userInfo.status === 'idle' || userInfo.status === 'failed')) {
      // Check if status is 'failed' to allow retries, 
      // or if userInfo is undefined (never fetched) or idle.
      // Avoid fetching if already loading or succeeded.
      dispatch(fetchUsername(principalString));
    }
  }, [principalString, userInfo, dispatch]);

  if (!principalString) {
    return { username: null, isLoading: false, principal: null };
  }

  if (userInfo) {
    return {
      username: userInfo.username,
      isLoading: userInfo.status === 'loading',
      principal: principalString,
      error: userInfo.error,
    };
  }

  // If userInfo is not yet available (e.g., first render before useEffect kicks in for fetching)
  return {
    username: null, // Or principalString as a fallback if preferred immediately
    isLoading: true, // Assume loading until useEffect dispatches and updates the store
    principal: principalString,
  };
}; 