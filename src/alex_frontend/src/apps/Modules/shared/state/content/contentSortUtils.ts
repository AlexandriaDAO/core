import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { Transaction } from '../../../shared/types/queries';
import { RootState } from '@/store';

// Memoized selector for filtered and sorted transactions
export const selectFilteredAndSortedTransactions = createSelector(
  [(state: RootState) => state.transactions.transactions,
   (state: RootState) => state.library.sortAsc,
   (state: RootState) => state.library.tags,
   (state: RootState) => state.nftData.nfts],
  (transactions, ascending, tags, nfts): Transaction[] => {
    // First filter
    const filteredTransactions = tags.length === 0 
      ? transactions 
      : transactions.filter((transaction: Transaction) => {
          const contentTypeTag = transaction.tags.find((tag: { name: string; value: string }) => tag.name === 'Content-Type');
          return contentTypeTag && tags.includes(contentTypeTag.value);
        });

    // Create a map of order indices from NFT data
    const orderMap = new Map();
    Object.values(nfts).forEach(nft => {
      if (nft.orderIndex !== undefined) {
        orderMap.set(nft.arweaveId, nft.orderIndex);
      }
    });

    // Sort transactions based on NFT order indices if available
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      const aOrderIndex = orderMap.get(a.id);
      const bOrderIndex = orderMap.get(b.id);
      
      // If both transactions have order indices, sort by them
      if (aOrderIndex !== undefined && bOrderIndex !== undefined) {
        return aOrderIndex - bOrderIndex;
      }
      
      // If only one has an order index, prioritize it
      if (aOrderIndex !== undefined) return -1;
      if (bOrderIndex !== undefined) return 1;
      
      // Otherwise, maintain the current order
      return 0;
    });

    // Apply ascending/descending sort if requested
    return ascending 
      ? sortedTransactions 
      : sortedTransactions.reverse();
  }
);

// Hook for components to easily access sorted/filtered transactions
export const useSortedTransactions = () => {
  return useSelector(selectFilteredAndSortedTransactions);
}; 