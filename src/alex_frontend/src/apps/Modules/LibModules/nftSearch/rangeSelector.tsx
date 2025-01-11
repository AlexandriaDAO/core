import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { AppDispatch } from '@/store';
import { updateSearchParams } from '../../shared/state/librarySearch/libraryThunks';
import { Pagination } from '../../shared/components/Pagination';

const DEFAULT_ITEMS_PER_PAGE = 20;

export default function RangeSelector() {
  const dispatch = useDispatch<AppDispatch>();
  const selectedPrincipal = useSelector((state: RootState) => state.library.selectedPrincipals[0]);
  const selectedCollection = useSelector((state: RootState) => state.library.collection);
  const searchParams = useSelector((state: RootState) => state.library.searchParams);
  const isLoading = useSelector((state: RootState) => state.library.isLoading);
  const totalNfts = useSelector((state: RootState) => state.nftData.totalNfts);
  
  const currentPage = Math.floor(searchParams.start / searchParams.pageSize) + 1;
  const totalPages = Math.ceil(totalNfts / searchParams.pageSize);

  const handlePageChange = async (page: number): Promise<void> => {
    const start = (page - 1) * searchParams.pageSize;
    const end = start + searchParams.pageSize;
    await dispatch(updateSearchParams({ start, end }));
  };

  const handleItemsPerPageChange = async (newPageSize: number): Promise<void> => {
    const start = 0;
    const end = newPageSize;
    await dispatch(updateSearchParams({ start, end, pageSize: newPageSize }));
  };

  if (!selectedPrincipal || !selectedCollection) return null;

  return (
    <div className="col-span-2 mt-4">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        loading={isLoading}
        totalItems={totalNfts}
        itemsPerPage={searchParams.pageSize}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}
