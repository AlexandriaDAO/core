import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AppDispatch } from '@/store';
import { performSearch } from '../state/librarySearch/libraryThunks';
import { clearNFTs } from '../state/nftData/nftDataSlice';

interface UsePaginationProps {
  defaultItemsPerPage: number;
  dependencies?: any[];
  shouldAutoFetch?: boolean;
}

export const usePagination = ({ defaultItemsPerPage, dependencies = [], shouldAutoFetch = false }: UsePaginationProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const totalItems = useSelector((state: RootState) => state.nftData.totalNfts);
  const loading = useSelector((state: RootState) => state.nftData.loading);
  const cachedPages = useSelector((state: RootState) => state.nftData.cachedPages);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchPageData = useCallback(async (page: number, perPage: number) => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    
    const pageKey = `${start}-${end}`;
    if (!cachedPages[pageKey] && !loading) {
      try {
        dispatch(clearNFTs());
        await dispatch(performSearch({ start, end })).unwrap();
      } catch (error) {
        console.error('Failed to fetch page:', error);
      }
    }
  }, [dispatch, loading, cachedPages]);

  // Reset to first page when dependencies change
  useEffect(() => {
    setCurrentPage(1);
    if (shouldAutoFetch) {
      fetchPageData(1, itemsPerPage);
    }
  }, [...dependencies, itemsPerPage]);

  const handlePageChange = useCallback(async (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(totalItems / itemsPerPage) || loading) return;
    setCurrentPage(newPage);
    await fetchPageData(newPage, itemsPerPage);
  }, [totalItems, itemsPerPage, loading, fetchPageData]);

  const handleItemsPerPageChange = useCallback(async (newItemsPerPage: number) => {
    const newTotalPages = Math.ceil(totalItems / newItemsPerPage);
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(newCurrentPage);
    await fetchPageData(newCurrentPage, newItemsPerPage);
  }, [currentPage, totalItems, fetchPageData]);

  return {
    currentPage,
    totalPages,
    loading,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    fetchPageData
  };
}; 