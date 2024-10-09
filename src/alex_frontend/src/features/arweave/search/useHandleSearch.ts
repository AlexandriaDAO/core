import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { performSearch } from '../thunks/performSearch';
import { setSearchState, setIsLoading } from '../arweaveSlice';

export const useHandleSearch = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchState = useSelector((state: RootState) => state.arweave.searchState);
  const isLoading = useSelector((state: RootState) => state.arweave.isLoading);

  const handleSearch = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      await dispatch(performSearch({ mode: searchState.mode }));
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, searchState.mode]);

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