import { createAsyncThunk } from '@reduxjs/toolkit';
import { setIsLoading } from './arweaveSlice';
import { setMintableStates } from '../content/contentDisplaySlice';
import { setTransactions } from '../content/contentDisplaySlice';
import { fetchTransactionsApi } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi';
import { SearchState } from '../../../shared/types/queries';
import { loadContentForTransactions } from '../content/contentDisplayThunks';

interface SearchParams {
  searchState: SearchState;
}

export const performSearch = createAsyncThunk(
  'arweave/performSearch',
  async (params: SearchParams, { dispatch }) => {
    const { searchState } = params;

    dispatch(setIsLoading(true));


    try {
      let maxTimestamp: number | undefined;

      if (searchState.filterDate) {
        const userDateTime = new Date(`${searchState.filterDate}T${searchState.filterTime || "00:00"}:00Z`);
        maxTimestamp = Math.floor(userDateTime.getTime() / 1000);
      }

      const fetchedTransactions = await fetchTransactionsApi({
        contentTypes: searchState.tags,
        amount: searchState.amount,
        maxTimestamp,
        ownerFilter: searchState.ownerFilter || undefined,
      });

      dispatch(setTransactions(fetchedTransactions));
      
      // Set initial mintable state for new transactions
      const newMintableStates = fetchedTransactions.reduce((acc, transaction) => {
        acc[transaction.id] = { mintable: false };
        return acc;
      }, {} as Record<string, { mintable: boolean }>);
      dispatch(setMintableStates(newMintableStates));

      // Load content and URLs for the transactions
      await dispatch(loadContentForTransactions(fetchedTransactions));

      return {
        transactions: fetchedTransactions,
        contentTypes: searchState.tags,
        amount: searchState.amount,
        ownerFilter: searchState.ownerFilter,
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    } finally {
      dispatch(setIsLoading(false));
    }
  }
);
