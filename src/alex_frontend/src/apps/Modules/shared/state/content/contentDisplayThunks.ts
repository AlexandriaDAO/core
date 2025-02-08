import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  setTransactions, 
  clearTransactions,
  setContentData,
} from './contentDisplaySlice';
import { fetchTransactionsForAlexandrian } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { Transaction } from '../../../shared/types/queries';
import { RootState } from '@/store';

export const loadContentForTransactions = createAsyncThunk(
  'contentDisplay/loadContent',
  async (transactions: Transaction[], { dispatch }) => {
    
    // Load content for each transaction
    await Promise.all(transactions.map(async (transaction) => {
      try {
        const content = await ContentService.loadContent(transaction);
        const urls = await ContentService.getContentUrls(transaction, content);
        
        // Combine content and urls into a single dispatch
        dispatch(setContentData({ 
          id: transaction.id, 
          content: {
            ...content,
            urls
          }
        }));

      } catch (error) {
        console.error('Error loading content:', error);
      }
    }));
  }
);

export const updateTransactions = createAsyncThunk(
  'contentDisplay/updateTransactions',
  async (arweaveIds: string[], { dispatch, getState }) => {
    try {
      if (arweaveIds.length === 0) {
        dispatch(setTransactions([]));
        return;
      }

      const state = getState() as RootState;
      const sortAsc = state.library.sortAsc;

      // Use the direct Arweave client for Alexandrian app
      const fetchedTransactions = await fetchTransactionsForAlexandrian(arweaveIds);

      // Apply sorting based on sortAsc
      const sortedTransactions = sortAsc 
        ? fetchedTransactions 
        : [...fetchedTransactions].reverse();

      dispatch(setTransactions(sortedTransactions));

    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
);

export const clearAllTransactions = createAsyncThunk(
  'contentDisplay/clearAllTransactions',
  async (_, { dispatch }) => {
    dispatch(clearTransactions());
    ContentService.clearCache();
  }
);