import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AppDispatch } from '@/store';
import { fetchTokensForPrincipal } from '../state/nftData/nftDataThunks';

interface UsePaginationProps {
  defaultItemsPerPage: number;
  principalId?: string;
  collection?: 'NFT' | 'SBT';
  dependencies?: any[];
}

export const usePagination = ({ 
  defaultItemsPerPage, 
  principalId,
  collection,
  dependencies = [] 
}: UsePaginationProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const totalItems = useSelector((state: RootState) => state.nftData.totalNfts);
  const loading = useSelector((state: RootState) => state.nftData.loading);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchPageData = useCallback(async (page: number, perPage: number) => {
    if (!principalId || !collection || loading) return;
    
    try {
      await dispatch(fetchTokensForPrincipal({
        principalId,
        collection,
        page,
        itemsPerPage: perPage
      })).unwrap();
    } catch (error) {
      console.error('Failed to fetch page:', error);
    }
  }, [dispatch, principalId, collection, loading]);

  // Reset to first page when dependencies change
  useEffect(() => {
    setCurrentPage(1);
    fetchPageData(1, itemsPerPage);
  }, [...dependencies, itemsPerPage, principalId, collection]);

  const handlePageChange = useCallback(async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || loading) return;
    setCurrentPage(newPage);
    await fetchPageData(newPage, itemsPerPage);
  }, [totalPages, itemsPerPage, loading, fetchPageData]);

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
    handleItemsPerPageChange
  };
}; 