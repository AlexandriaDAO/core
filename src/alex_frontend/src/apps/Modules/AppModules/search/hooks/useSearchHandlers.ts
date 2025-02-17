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
  const lastCursor = useSelector((state: RootState) => state.arweave.lastCursor);

  const handleSearch = useCallback(async (continueFromTimestamp?: number, overrideAmount?: number) => {
    if (isLoading) return;
    
    dispatch(setIsLoading(true));
    try {
      let updatedSearchState = { ...searchState };

      if (overrideAmount) {
        updatedSearchState.amount = overrideAmount;
      }

      await dispatch(performSearch({ 
        searchState: updatedSearchState,
        isContinuation: !!continueFromTimestamp,
        after: lastCursor || undefined
      }));
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, searchState, isLoading, lastCursor]);

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