import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { wipe } from "../../shared/state/wiper";
import PrincipalSelector from "./PrincipalSelector";
import SortSelector from "./SortSelector";
import LibraryContentTagsSelector from "./tagSelector";
import { loadContentForTransactions } from "../../shared/state/content/contentDisplayThunks";

export default function librarySearch() {
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(wipe());
  }, [selectedPrincipals]);

  useEffect(() => {
    if (transactions.length > 0) {
      dispatch(loadContentForTransactions(transactions));
    }
  }, [transactions, dispatch]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Library Collection
        </h2>
        
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
