import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import PrincipalSelector from "./PrincipalSelector";
import CollectionSelector from "./collectionSelector";
import LibraryContentTagsSelector from "./tagSelector";
import { loadContentForTransactions } from "../../shared/state/content/contentDisplayThunks";
import { performSearch } from '../../shared/state/librarySearch/libraryThunks';
import RangeSelector from './rangeSelector';

export default function LibrarySearch() {
  const dispatch = useDispatch<AppDispatch>();
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const collection = useSelector((state: RootState) => state.library.collection);

  useEffect(() => {
    if (transactions.length > 0) {
      dispatch(loadContentForTransactions(transactions));
    }
  }, [transactions, dispatch]);

  useEffect(() => {
    if (selectedPrincipals.length > 0 && collection) {
      dispatch(performSearch());
    }
  }, [selectedPrincipals, collection, dispatch]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-3">
      <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
          <div className="flex flex-col space-y-2">
            <PrincipalSelector shouldTriggerSearch={false} />
            <CollectionSelector />
          </div>
          <LibraryContentTagsSelector />
        </div>
        <RangeSelector />
      </div>
    </div>
  );
}
