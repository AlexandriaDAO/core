import React from 'react';
import { Input } from '@/lib/components/input';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageInput: string;
  loading: boolean;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => Promise<void>;
  onPageInputChange: (value: string) => void;
  onItemsPerPageChange: (value: number) => Promise<void>;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageInput,
  loading,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageInputChange,
  onItemsPerPageChange,
}) => {
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      onPageInputChange(value);
    }
  };

  const handlePageInputSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      const pageNumber = parseInt(pageInput);
      if (pageNumber && pageNumber >= 1 && pageNumber <= totalPages) {
        await onPageChange(pageNumber);
      }
    }
  };

  const handleBlur = async () => {
    if (pageInput && !loading) {
      const pageNumber = parseInt(pageInput);
      if (pageNumber && pageNumber >= 1 && pageNumber <= totalPages) {
        await onPageChange(pageNumber);
      } else {
        onPageInputChange('');
      }
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} NFTs
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              disabled={loading}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
            >
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-300">per page</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Page</span>
            <Input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputSubmit}
              onBlur={handleBlur}
              disabled={loading}
              className="w-16 text-center"
              placeholder={currentPage.toString()}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">of {totalPages}</span>
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {loading && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      )}
    </div>
  );
}; 