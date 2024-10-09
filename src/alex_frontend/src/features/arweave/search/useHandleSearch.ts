import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { performSearch } from '../thunks/performSearch';
import { setSearchState } from '../arweaveSlice';

export const useHandleSearch = (mode: 'random' | 'general' | 'user') => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      await dispatch(performSearch({ mode: mode === 'user' ? 'general' : mode }));
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, mode]);

  const handleContentCategoryChange = useCallback((value: string) => {
    dispatch(setSearchState({ contentCategory: value }));
  }, [dispatch]);

  const handleContentTypeChange = useCallback((value: string) => {
    dispatch(setSearchState({ contentType: value }));
  }, [dispatch]);

  const handleAmountChange = useCallback((value: number) => {
    dispatch(setSearchState({ amount: value }));
  }, [dispatch]);

  const handleFilterDateChange = useCallback((value: string) => {
    dispatch(setSearchState({ filterDate: value }));
  }, [dispatch]);

  const handleFilterTimeChange = useCallback((value: string) => {
    dispatch(setSearchState({ filterTime: value }));
  }, [dispatch]);

  const handleOwnerFilterChange = useCallback((value: string) => {
    dispatch(setSearchState({ ownerFilter: value }));
  }, [dispatch]);

  const handleAdvancedOptionsToggle = useCallback((value: boolean) => {
    dispatch(setSearchState({ advancedOptionsOpen: value }));
  }, [dispatch]);

  return {
    isLoading,
    handleSearch,
    handleContentCategoryChange,
    handleContentTypeChange,
    handleAmountChange,
    handleFilterDateChange,
    handleFilterTimeChange,
    handleOwnerFilterChange,
    handleAdvancedOptionsToggle,
  };
};