import { createAsyncThunk } from '@reduxjs/toolkit';
import { setIsLoading } from './arweaveSlice';
import { setMintableStates } from '../content/contentDisplaySlice';
import { setTransactions } from '../content/contentDisplaySlice';
import { fetchTransactionsApi } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi';
import { SearchState } from '../../../shared/types/queries';
import { loadContentForTransactions } from '../content/contentDisplayThunks';
import { RootState } from '@/store';

interface SearchParams {
  searchState: SearchState;
  isContinuation?: boolean;
}

export const performSearch = createAsyncThunk(
  'arweave/performSearch',
  async ({ searchState, isContinuation = false }: SearchParams, { dispatch, getState }) => {
    dispatch(setIsLoading(true));
    console.log('Perform Search - Starting with params:', {
      searchState,
      isContinuation
    });

    try {
      let maxTimestamp: number | undefined;

      if (searchState.maxTimestamp) {
        maxTimestamp = searchState.maxTimestamp;
      } else if (searchState.filterDate) {
        const userDateTime = new Date(`${searchState.filterDate}T${searchState.filterTime || "00:00"}:00Z`);
        maxTimestamp = Math.floor(userDateTime.getTime() / 1000);
      }

      console.log('Perform Search - API call params:', {
        contentTypes: searchState.tags,
        amount: searchState.amount,
        maxTimestamp,
        ownerFilter: searchState.ownerFilter || undefined
      });

      const fetchedTransactions = await fetchTransactionsApi({
        contentTypes: searchState.tags,
        amount: searchState.amount,
        maxTimestamp,
        ownerFilter: searchState.ownerFilter || undefined,
      });

      console.log('Perform Search - Fetched transactions count:', fetchedTransactions.length);

      // Get existing transactions if continuing a search
      const state = getState() as RootState;
      const existingTransactions = isContinuation 
        ? state.contentDisplay.transactions 
        : [];

      // Create a Set of existing transaction IDs for efficient lookup
      const existingIds = new Set(existingTransactions.map(t => t.id));
      
      // Filter out any duplicates from the new transactions
      const uniqueNewTransactions = fetchedTransactions.filter(
        transaction => !existingIds.has(transaction.id)
      );
      
      // Combine existing and filtered new transactions
      const combinedTransactions = [...existingTransactions, ...uniqueNewTransactions];
      
      dispatch(setTransactions(combinedTransactions));
      
      // Set initial mintable state for new transactions only
      const newMintableStates = uniqueNewTransactions.reduce((acc, transaction) => {
        acc[transaction.id] = { mintable: false };
        return acc;
      }, {} as Record<string, { mintable: boolean }>);
      dispatch(setMintableStates(newMintableStates));

      // Load content and URLs for the new transactions only
      await dispatch(loadContentForTransactions(uniqueNewTransactions));

      return {
        transactions: combinedTransactions,
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
