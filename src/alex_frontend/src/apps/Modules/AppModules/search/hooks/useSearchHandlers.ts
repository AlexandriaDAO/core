import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { performSearch } from '@/apps/Modules/shared/state/arweave/arweaveThunks';
import { setSearchState, setIsLoading } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { SearchState } from '../../../shared/types/queries';

export const useHandleSearch = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchState = useSelector((state: RootState) => state.arweave.searchState);
  const isLoading = useSelector((state: RootState) => state.arweave.isLoading);

  const handleSearch = useCallback(async (continueFromTimestamp?: number, overrideAmount?: number, after?: string) => {
    if (isLoading) return;
    
    dispatch(setIsLoading(true));
    try {
      let updatedSearchState = { ...searchState };

      if (overrideAmount) {
        updatedSearchState.amount = overrideAmount;
      }

      if (continueFromTimestamp) {
        // Convert to milliseconds if it's in seconds
        const timestampMs = continueFromTimestamp * (continueFromTimestamp < 1e12 ? 1000 : 1);
        updatedSearchState.timestamp = timestampMs;
      }

      await dispatch(performSearch({ 
        searchState: updatedSearchState,
        isContinuation: !!continueFromTimestamp || !!after,
        after
      }));
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, searchState, isLoading]);

  const handleSearchStateChange = useCallback((key: keyof SearchState, value: any) => {
    dispatch(setSearchState({ [key]: value }));
  }, [dispatch]);

  return {
    searchState,
    isLoading,
    handleSearch,
    handleSearchStateChange,
  };
};