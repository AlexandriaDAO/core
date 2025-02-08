import { createAsyncThunk } from '@reduxjs/toolkit';
import { setIsLoading, setPredictionResults, PredictionResults } from './arweaveSlice';
import { setTransactions } from '../content/contentDisplaySlice';
import { fetchTransactionsApi } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi';
import { SearchState } from '../../../shared/types/queries';
import { loadContentForTransactions } from '../content/contentDisplayThunks';
import { RootState } from '@/store';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';

// Create a thunk to handle prediction results
export const updatePredictionResults = createAsyncThunk(
  'arweave/updatePredictionResults',
  async ({ id, predictions }: { id: string; predictions: PredictionResults }, { dispatch }) => {
    dispatch(setPredictionResults({ id, predictions }));
  }
);

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
      isContinuation,
      timestamp: searchState.timestamp,
      timestampDate: searchState.timestamp ? new Date(searchState.timestamp).toISOString() : null
    });

    try {
      // Clear cache and transactions if this is a new search
      if (!isContinuation) {
        ContentService.clearCache();
        dispatch(setTransactions([]));
      }

      const fetchedTransactions = await fetchTransactionsApi({
        contentTypes: searchState.tags,
        amount: searchState.amount,
        timestamp: searchState.timestamp,
        ownerFilter: searchState.ownerFilter || undefined,
      });

      console.log('Perform Search - Fetched transactions:', {
        count: fetchedTransactions.length,
        firstTimestamp: fetchedTransactions[0]?.block?.timestamp,
        lastTimestamp: fetchedTransactions[fetchedTransactions.length - 1]?.block?.timestamp
      });

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
