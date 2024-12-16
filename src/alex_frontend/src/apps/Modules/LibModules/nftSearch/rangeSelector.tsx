import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { usePagination } from '../../shared/hooks/usePagination';
import { Pagination } from '../../shared/components/Pagination';

const DEFAULT_ITEMS_PER_PAGE = 20;

export default function RangeSelector() {
  const selectedPrincipal = useSelector((state: RootState) => state.library.selectedPrincipals);
  const selectedCollection = useSelector((state: RootState) => state.library.collection);
  
  const {
    currentPage,
    pageInput,
    totalPages,
    loading,
    totalItems,
    itemsPerPage,
    setPageInput,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination({
    defaultItemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    dependencies: [selectedPrincipal, selectedCollection]
  });

  if (!totalItems) return null;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      pageInput={pageInput}
      loading={loading}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onPageInputChange={setPageInput}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );
}
