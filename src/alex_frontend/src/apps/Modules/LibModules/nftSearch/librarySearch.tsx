import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import PrincipalSelector from "./PrincipalSelector";
import SortSelector from "./SortSelector";
import CollectionSelector from "./collectionSelector";
import LibraryContentTagsSelector from "./tagSelector";
import { loadContentForTransactions } from "../../shared/state/content/contentDisplayThunks";
import { performSearch } from '../../shared/state/librarySearch/libraryThunks';
import RangeSelector from './rangeSelector';

export default function LibrarySearch() {
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
  const dispatch = useDispatch<AppDispatch>();

  const handleSearch = useCallback(() => {
    dispatch(performSearch({ start: 0, end: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (transactions.length > 0) {
      dispatch(loadContentForTransactions(transactions));
    }
  }, [transactions, dispatch]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleSearch]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="space-y-6">
          {/* Search Controls Section */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
              Search & Filter
            </h3>
            
            <div className="space-y-4">

              {/* Sort Controls */}
              <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[80px]">
                  Sort by:
                </span>
                <CollectionSelector />
                <SortSelector />
              </div>

              {/* Principal Selection */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
                <span className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Select Principals:
                </span>
                <PrincipalSelector />
              </div>

              {/* Tags Selection */}
              <div>
                <span className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Filter by Tags:
                </span>
                <LibraryContentTagsSelector />
              </div>

              {/* Add RangeSelector */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
                <RangeSelector />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
