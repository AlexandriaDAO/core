import { useSelector } from 'react-redux';
import { Transaction } from '../../../shared/types/queries';
import { RootState } from '@/store';

export const useSortedTransactions = (): Transaction[] => {
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
  const sortAsc = useSelector((state: RootState) => state.library.sortAsc);

  return sortAsc ? [...transactions] : [...transactions].reverse();
};

// Pure function version for use in reducers/thunks
export const sortTransactions = (transactions: Transaction[], ascending: boolean): Transaction[] => {
  return ascending ? [...transactions] : [...transactions].reverse();
}; 