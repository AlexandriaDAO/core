import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AppDispatch } from '@/store';
import { performSearch } from '../state/librarySearch/libraryThunks';

interface UsePaginationProps {
  defaultItemsPerPage: number;
  dependencies?: any[];
}

export const usePagination = ({ defaultItemsPerPage, dependencies = [] }: UsePaginationProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const totalItems = useSelector((state: RootState) => state.nftData.totalNfts);
  const loading = useSelector((state: RootState) => state.nftData.loading);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    setPageInput('');
  }, [...dependencies, itemsPerPage]);

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || loading) return;
    
    const start = (newPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    try {
      await dispatch(performSearch({ start, end })).unwrap();
      setCurrentPage(newPage);
      setPageInput('');
    } catch (error) {
      console.error('Failed to change page:', error);
    }
  };

  const handleItemsPerPageChange = async (newItemsPerPage: number) => {
    const newTotalPages = Math.ceil(totalItems / newItemsPerPage);
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    
    setItemsPerPage(newItemsPerPage);
    await handlePageChange(newCurrentPage);
  };

  return {
    currentPage,
    pageInput,
    totalPages,
    loading,
    totalItems,
    itemsPerPage,
    setPageInput,
    handlePageChange,
    handleItemsPerPageChange
  };
}; 