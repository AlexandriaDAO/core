import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { performSearch } from '@/apps/Modules/shared/state/arweave/arweaveThunks';
import { setSearchState, setIsLoading, setFilterDate, setFilterTime } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { SearchState } from '../../../shared/types/queries';

export const useHandleSearch = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchState = useSelector((state: RootState) => state.arweave.searchState);
  const isLoading = useSelector((state: RootState) => state.arweave.isLoading);

  const handleSearch = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      let updatedSearchState = { ...searchState };

      if (searchState.filterDate && searchState.filterTime) {
        const utcDate = new Date(`${searchState.filterDate}T${searchState.filterTime}:00Z`);
        updatedSearchState.maxTimestamp = Math.floor(utcDate.getTime() / 1000);
      }

      await dispatch(performSearch({ searchState: updatedSearchState }));
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, searchState]);

  const handleSearchStateChange = useCallback((key: keyof SearchState, value: any) => {
    switch (key) {
      case 'filterDate':
        dispatch(setFilterDate(value));
        break;
      case 'filterTime':
        dispatch(setFilterTime(value));
        break;
      default:
        dispatch(setSearchState({ [key]: value }));
    }
  }, [dispatch]);

  return {
    searchState,
    isLoading,
    handleSearch,
    handleSearchStateChange,
  };
};