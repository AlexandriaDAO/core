import { useCallback } from 'react';
import { fetchRecentTransactions, fetchTransactionsByIds } from "./ArweaveQueries";
import { Transaction } from "../types/queries";
import { fileTypeCategories } from "../types/files";
import { Dispatch, SetStateAction } from 'react';

interface SearchState {
  contentType: string;
  setContentType: Dispatch<SetStateAction<string>>;
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
  filterDate: string;
  setFilterDate: Dispatch<SetStateAction<string>>;
  filterTime: string;
  setFilterTime: Dispatch<SetStateAction<string>>;
  ownerFilter: string;
  setOwnerFilter: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  minBlock?: number;
  setMinBlock: Dispatch<SetStateAction<number | undefined>>;
  maxBlock?: number;
  setMaxBlock: Dispatch<SetStateAction<number | undefined>>;
  contentCategory: string;
  setContentCategory: Dispatch<SetStateAction<string>>;
  advancedOptionsOpen: boolean;
  setAdvancedOptionsOpen: Dispatch<SetStateAction<boolean>>;
}

interface UseHandleSearchParams {
  state: SearchState;
  mode: 'user' | 'general';
  userTransactionIds: string[];
  onTransactionsUpdate: (transactions: Transaction[], lastTimestamp: number, contentTypes: string[], amount: number, ownerFilter: string, minBlock?: number, maxBlock?: number) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export default function useHandleSearch({
  state,
  mode,
  userTransactionIds,
  onTransactionsUpdate,
  onLoadingChange,
}: UseHandleSearchParams) {
  const { 
    contentType, contentCategory, advancedOptionsOpen,
    amount, filterDate, filterTime, ownerFilter,
    isLoading, setIsLoading,
    minBlock, maxBlock,
    setFilterDate, setFilterTime,
  } = state;

  const handleSearch = useCallback(async () => {
    if (!advancedOptionsOpen) {
      // Generate random date and time when advanced options are closed
      const startTimestamp = new Date('2019-06-01').getTime() / 1000;
      const endTimestamp = Date.now() / 1000;
      const randomTimestamp = Math.floor(Math.random() * (endTimestamp - startTimestamp) + startTimestamp);

      const randomDate = new Date(randomTimestamp * 1000);
      const dateString = randomDate.toISOString().substr(0, 10);
      const timeString = randomDate.toISOString().substr(11, 5);

      setFilterDate(dateString);
      setFilterTime(timeString);
    }

    setIsLoading(true);
    onLoadingChange(true);

    try {
      let maxTimestamp: number | undefined;

      if (filterDate) {
        const userDateTime = new Date(`${filterDate}T${filterTime || "00:00"}:00Z`);
        maxTimestamp = Math.floor(userDateTime.getTime() / 1000);
      }

      let contentTypes: string[] = [];

      if (advancedOptionsOpen && contentType) {
        contentTypes = [contentType];
      } else if (contentCategory && contentCategory !== "") {
        contentTypes = fileTypeCategories[contentCategory] || [];
      }

      let fetchedTransactions: Transaction[];

      if (mode === "user") {
        fetchedTransactions = await fetchTransactionsByIds(
          userTransactionIds,
          contentTypes,
          maxTimestamp
        );
      } else {
        fetchedTransactions = await fetchRecentTransactions(
          contentTypes,
          amount,
          maxTimestamp,
          ownerFilter || undefined,
          minBlock,
          maxBlock
        );
      }

      console.log("Fetched transactions:", fetchedTransactions);
      const lastTimestamp = fetchedTransactions.length > 0
        ? fetchedTransactions[fetchedTransactions.length - 1].block?.timestamp || 0
        : 0;
      onTransactionsUpdate(
        fetchedTransactions,
        lastTimestamp,
        contentTypes,
        amount,
        ownerFilter || "",
        minBlock,
        maxBlock
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }, [
    contentType,
    contentCategory,
    advancedOptionsOpen,
    amount,
    filterDate,
    filterTime,
    ownerFilter,
    mode,
    userTransactionIds,
    onTransactionsUpdate,
    onLoadingChange,
    minBlock,
    maxBlock,
    setFilterDate,
    setFilterTime,
    setIsLoading,
  ]);

  return { handleSearch };
}