import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import PrincipalSelector from "./PrincipalSelector";
import CollectionSelector from "./collectionSelector";
import LibraryContentTagsSelector from "./tagSelector";
import { loadContentForTransactions } from "../../shared/state/content/contentDisplayThunks";
import RangeSelector from './rangeSelector';

export default function LibrarySearch() {
  const dispatch = useDispatch<AppDispatch>();
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const collection = useSelector((state: RootState) => state.library.collection);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transactions.length > 0 && !isLoading) {
      setIsLoading(true);
      dispatch(loadContentForTransactions(transactions))
        .finally(() => setIsLoading(false));
    }
  }, [transactions, dispatch, isLoading]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[8px] md:rounded-[12px] shadow-md p-2 sm:p-3">
      <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
          <div className="flex flex-col space-y-2">
            <PrincipalSelector />
            <CollectionSelector />
          </div>
          <LibraryContentTagsSelector />
        </div>
        <RangeSelector />
      </div>
    </div>
  );
}