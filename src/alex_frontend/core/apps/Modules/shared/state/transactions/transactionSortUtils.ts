import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { Transaction } from '../../../shared/types/queries';
import { RootState } from '@/store';

// Memoized selector for filtered and sorted transactions
export const selectFilteredAndSortedTransactions = createSelector(
  [(state: RootState) => state.transactions.transactions,
   (state: RootState) => state.library.sortAsc,
   (state: RootState) => state.library.tags],
  (transactions, ascending, tags): Transaction[] => {
    // First filter
    const filteredTransactions = tags.length === 0 
      ? transactions 
      : transactions.filter(transaction => {
          const contentTypeTag = transaction.tags.find(tag => tag.name === 'Content-Type');
          return contentTypeTag && tags.includes(contentTypeTag.value);
        });

    // Then sort
    return ascending 
      ? filteredTransactions 
      : [...filteredTransactions].reverse();
  }
);

// Hook for components to easily access sorted/filtered transactions
export const useSortedTransactions = () => {
  return useSelector(selectFilteredAndSortedTransactions);
}; 