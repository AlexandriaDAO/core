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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col space-y-2">
            <PrincipalSelector />
            <CollectionSelector />
            <RangeSelector />
          </div>
          <div className="flex flex-col space-y-2">
            <SortSelector />
            <LibraryContentTagsSelector />
          </div>
        </div>
      </div>
    </div>
  );
}
