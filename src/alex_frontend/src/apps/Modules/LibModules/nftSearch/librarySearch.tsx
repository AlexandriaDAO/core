import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import PrincipalSelector from "./PrincipalSelector";
import CollectionSelector from "./collectionSelector";
import LibraryContentTagsSelector from "./tagSelector";
import { loadContentForTransactions } from "../../shared/state/transactions/transactionThunks";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/components/select";
import { setSearchParams } from "../../shared/state/librarySearch/librarySlice";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const NFTPagination = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { totalItems, searchParams, collection } = useSelector((state: RootState) => state.library);
  const currentPage = Math.floor(searchParams.start / searchParams.pageSize) + 1;
  const totalPages = Math.ceil(totalItems / searchParams.pageSize);
  const [pageInput, setPageInput] = useState<string>(currentPage.toString());

  // Get the content type label based on collection
  const contentTypeLabel = collection === 'SBT' ? 'SBTs' : 'NFTs';

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

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPageInput(inputValue);
    
    // Try to parse the input as a number
    const pageNumber = parseInt(inputValue);
    
    // If it's a valid page number, navigate to that page
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      // Add a small delay to avoid rapid changes while typing
      const timeoutId = setTimeout(() => {
        handlePageChange(pageNumber);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  // Keep the handleKeyDown for Enter key support, but simplify it
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const pageNumber = parseInt(pageInput);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        handlePageChange(pageNumber);
      } else {
        // Reset to current page if invalid input
        setPageInput(currentPage.toString());
      }
    }
  };

  // Update page input when current page changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 h-8 text-sm"
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handleKeyDown}
              className="w-16 h-8 text-sm"
              scale="sm"
              aria-label="Go to page"
              title="Type a page number to navigate"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 h-8 text-sm"
          >
            Next
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <span className="text-sm text-muted-foreground">
            (Showing {contentTypeLabel} {searchParams.start + 1}-{Math.min(searchParams.start + searchParams.pageSize, totalItems)} of {totalItems})
          </span>
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
    </div>
  );
};

interface LibrarySearchProps {
  defaultCategory?: 'favorites' | 'all';
}

export default function LibrarySearch({ defaultCategory = 'favorites' }: LibrarySearchProps) {
  const dispatch = useDispatch<AppDispatch>();
  const transactionData = useSelector((state: RootState) => state.transactions.transactions);
  const isTransactionUpdated = useSelector((state: RootState) => state.transactions.isUpdated);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      if (transactionData.length > 0 && !isLoading) {
        setIsLoading(true);
        try {
          await dispatch(loadContentForTransactions(transactionData));
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
  }, [dispatch, transactionData, isTransactionUpdated]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[8px] md:rounded-[12px] shadow-md p-2 sm:p-3">
      <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* First row: Principal and Collection selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            <div className="flex flex-col space-y-2">
              <PrincipalSelector />
              <CollectionSelector />
            </div>
            <LibraryContentTagsSelector defaultCategory={defaultCategory} />
          </div>
          
          {/* Second row: Pagination controls (full width) */}
          <div className="w-full">
            <NFTPagination />
          </div>
        </div>
      </div>
    </div>
  );
}