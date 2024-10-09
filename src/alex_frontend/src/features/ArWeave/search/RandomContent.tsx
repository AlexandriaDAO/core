import React, { useState, useCallback } from "react";
import { Transaction, RandomContentProps } from "../types/queries";
import { fetchRecentTransactions, fetchTransactionsByIds } from "./ArweaveQueries";

export default function RandomContent({ 
  onTransactionsUpdate, 
  onLoadingChange,
  mode,
  userTransactionIds = []
}: RandomContentProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRandomSearch = useCallback(async () => {
    setIsLoading(true);
    onLoadingChange(true);

    try {
      const startTimestamp = new Date('2019-06-01').getTime() / 1000;
      const endTimestamp = Date.now() / 1000;
      const randomTimestamp = Math.floor(Math.random() * (endTimestamp - startTimestamp) + startTimestamp);

      let fetchedTransactions: Transaction[];

      if (mode === "user") {
        fetchedTransactions = await fetchTransactionsByIds(
          userTransactionIds,
          undefined,
          randomTimestamp
        );
      } else {
        fetchedTransactions = await fetchRecentTransactions(
          undefined,
          12,
          randomTimestamp
        );
      }

      console.log("Fetched random transactions:", fetchedTransactions);
      const lastTimestamp = fetchedTransactions.length > 0
        ? fetchedTransactions[fetchedTransactions.length - 1].block?.timestamp || 0
        : 0;
      onTransactionsUpdate(
        fetchedTransactions,
        lastTimestamp,
        [],
        12,
        "",
        undefined,
        undefined
      );
    } catch (error) {
      console.error("Error fetching random transactions:", error);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }, [mode, userTransactionIds, onTransactionsUpdate, onLoadingChange]);

  return (
    <div className="text-center">
      <button 
        onClick={handleRandomSearch}
        className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        }`}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Get Random Content'}
      </button>
    </div>
  );
}