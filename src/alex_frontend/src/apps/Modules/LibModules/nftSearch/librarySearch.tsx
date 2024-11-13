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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center space-x-2">
        <SortSelector />
      </div>
      <PrincipalSelector />
      <LibraryContentTagsSelector />
    </div>
  );
}
