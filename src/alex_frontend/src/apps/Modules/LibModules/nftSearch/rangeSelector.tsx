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
    totalPages,
    loading,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination({
    defaultItemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    dependencies: [selectedPrincipal, selectedCollection]
  });

  if (!totalItems) return null;

  return (
    <div className="col-span-2 mt-4">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}
