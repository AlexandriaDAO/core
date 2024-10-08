import React, { useCallback } from 'react';
import { Transaction } from './types/queries';
import { fetchRecentTransactions, fetchTransactionsByIds } from './ArweaveQueries';

interface LoadMoreProps {
  onTransactionsUpdate: (transactions: Transaction[], lastTimestamp: number) => void;
  contentTypes: string[];
  amount: number;
  lastTimestamp: number;
  ownerFilter?: string;
  minBlock?: number;
  maxBlock?: number;
  mode: 'user' | 'general';
  userTransactionIds?: string[];
}

const LoadMore: React.FC<LoadMoreProps> = ({
  onTransactionsUpdate,
  contentTypes,
  amount,
  lastTimestamp,
  ownerFilter,
  minBlock,
  maxBlock,
  mode,
  userTransactionIds = [],
}) => {
  const handleLoadMore = useCallback(async () => {
    try {
      const newTransactions: Transaction[] = mode === 'user'
        ? await fetchTransactionsByIds(userTransactionIds, contentTypes, lastTimestamp)
        : await fetchRecentTransactions(contentTypes, amount, lastTimestamp, ownerFilter, minBlock, maxBlock);

      const newLastTimestamp = newTransactions.length > 0
        ? newTransactions[newTransactions.length - 1].block?.timestamp || 0
        : lastTimestamp;

      onTransactionsUpdate(newTransactions, newLastTimestamp);
    } catch (error) {
      console.error("Error fetching more transactions:", error);
    }
  }, [mode, userTransactionIds, contentTypes, amount, lastTimestamp, ownerFilter, minBlock, maxBlock, onTransactionsUpdate]);

  return (
    <button
      onClick={handleLoadMore}
      className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Load More
    </button>
  );
};

export default React.memo(LoadMore);