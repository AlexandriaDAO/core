import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import PrincipalSelector from "./PrincipalSelector";
import CollectionSelector from "./collectionSelector";
import LibraryContentTagsSelector from "./tagSelector";
import { loadContentForTransactions } from "../../shared/state/content/contentDisplayThunks";
import { Label } from "@/lib/components/label";
import { Button } from "@/lib/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/components/select";
import { setSearchParams } from "../../shared/state/librarySearch/librarySlice";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const NFTPagination = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { totalItems, searchParams } = useSelector((state: RootState) => state.library);
  const currentPage = Math.floor(searchParams.start / searchParams.pageSize) + 1;
  const totalPages = Math.ceil(totalItems / searchParams.pageSize);

  const handlePageChange = (newPage: number) => {
    const start = (newPage - 1) * searchParams.pageSize;
    const end = Math.min(start + searchParams.pageSize, totalItems);
    dispatch(setSearchParams({ start, end }));
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    const start = 0; // Reset to first page when changing page size
    const end = Math.min(size, totalItems);
    dispatch(setSearchParams({ start, end, pageSize: size }));
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col space-y-4">
      <Label>NFT Range (Total: {totalItems})</Label>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 h-8 text-sm"
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 h-8 text-sm"
          >
            Next
          </Button>
        </div>
        <Select
          value={searchParams.pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Page size" />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size} items
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default function LibrarySearch() {
  const dispatch = useDispatch<AppDispatch>();
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
  const isTransactionUpdated = useSelector((state: RootState) => state.contentDisplay.isUpdated);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      if (transactions.length > 0 && !isLoading) {
        setIsLoading(true);
        try {
          await dispatch(loadContentForTransactions(transactions));
        } catch (error) {
          console.error('Error loading content:', error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [dispatch, transactions, isTransactionUpdated]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[8px] md:rounded-[12px] shadow-md p-2 sm:p-3">
      <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
          <div className="flex flex-col space-y-2">
            <PrincipalSelector />
            <CollectionSelector />
            <NFTPagination />
          </div>
          <LibraryContentTagsSelector />
        </div>
      </div>
    </div>
  );
}