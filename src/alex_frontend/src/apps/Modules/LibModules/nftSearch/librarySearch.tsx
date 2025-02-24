import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import PrincipalSelector from "./PrincipalSelector";
import CollectionSelector from "./collectionSelector";
import LibraryContentTagsSelector from "./tagSelector";
import { loadContentForTransactions } from "../../shared/state/content/contentDisplayThunks";

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
  }, [dispatch, transactions, isTransactionUpdated]); // Added transactions to dependencies

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
      </div>
    </div>
  );
}