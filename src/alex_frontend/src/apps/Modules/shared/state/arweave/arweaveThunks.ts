import { createAsyncThunk } from '@reduxjs/toolkit';
import { setIsLoading, setPredictionResults, setLastCursor, PredictionResults } from './arweaveSlice';
import { setTransactions } from '../transactions/transactionSlice';
import { fetchTransactionsApi } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi';
import { SearchState } from '../../../shared/types/queries';
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
  after?: string;
}

export const performSearch = createAsyncThunk(
  'arweave/performSearch',
  async ({ searchState, isContinuation = false, after }: SearchParams, { dispatch, getState }) => {
    dispatch(setIsLoading(true));
    console.log('Perform Search - Starting with params:', {
      searchState,
      isContinuation,
      after,
    });
    
    try {
      // Clear cache and transactions if this is a new search
      if (!isContinuation) {
        ContentService.clearCache();
        dispatch(setTransactions([]));
      }

      // Call API with the correctly formatted params
      const fetchedTransactions = await fetchTransactionsApi({
        contentTypes: searchState.tags,
        amount: searchState.amount,
        ownerFilter: searchState.ownerFilter || undefined,
        after,
        timestamp: searchState.timestamp
      });

      if (!fetchedTransactions || fetchedTransactions.length === 0) {
        console.log('No transactions found');
        dispatch(setIsLoading(false));
        return [];
      }

      // Get the last cursor (timestamp from the last transaction)
      const lastTransaction = fetchedTransactions[fetchedTransactions.length - 1];
      if (lastTransaction?.cursor) {
        dispatch(setLastCursor(lastTransaction.cursor));
      }

      // Get the existing transactions if this is a continuation of a search
      const state = getState() as RootState;
      const existingTransactions = isContinuation 
        ? state.transactions.transactions 
        : [];

      // Create a Set of existing transaction IDs for efficient lookup
      const existingIds = new Set(existingTransactions.map(t => t.id));

      // Filter out any duplicates from the new transactions
      const uniqueNewTransactions = fetchedTransactions.filter(
        transaction => !existingIds.has(transaction.id)
      );

      console.log(`Found ${uniqueNewTransactions.length} new unique transactions`);

      // Combine existing transactions with new ones
      const allTransactions = [...existingTransactions, ...uniqueNewTransactions];
      
      // Update the Redux store with the transactions
      dispatch(setTransactions(allTransactions));
      
      // Load content for each new transaction
      for (const transaction of uniqueNewTransactions) {
        try {
          const content = await ContentService.loadContent(transaction);
          const urls = await ContentService.getContentUrls(transaction, content);
          
          dispatch({
            type: 'transactions/setContentData',
            payload: {
              id: transaction.id,
              content: {
                ...content,
                urls
              }
            }
          });
        } catch (error) {
          console.error(`Error loading content for transaction ${transaction.id}:`, error);
        }
      }
      
      dispatch(setIsLoading(false));
      return uniqueNewTransactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      dispatch(setIsLoading(false));
      return [];
    }
  }
);
