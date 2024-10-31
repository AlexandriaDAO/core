import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  setTransactions, 
  addTransactions, 
  clearTransactions,
  setMintableStates,
  setContentData,
  setMintableState,
  MintableStateItem 
} from './contentDisplaySlice';
import { fetchTransactionsApi } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { Transaction } from '../../../shared/types/queries';

export const loadContentForTransactions = createAsyncThunk(
  'contentDisplay/loadContent',
  async (transactions: Transaction[], { dispatch }) => {
    const initialStates = ContentService.getInitialMintableStates(transactions);
    dispatch(setMintableStates(initialStates));

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

        if (content.error) {
          dispatch(setMintableState({ id: transaction.id, mintable: false }));
        }
      } catch (error) {
        console.error('Error loading content:', error);
      }
    }));
  }
);

export const updateTransactions = createAsyncThunk(
  'contentDisplay/updateTransactions',
  async (arweaveIds: string[], { dispatch }) => {
    try {
      const fetchedTransactions = await fetchTransactionsApi({
        nftIds: arweaveIds,
      });

      dispatch(setTransactions(fetchedTransactions));

      // Set initial mintable state for new transactions
      const newMintableStates = fetchedTransactions.reduce((acc, transaction) => {
        acc[transaction.id] = { mintable: false };
        return acc;
      }, {} as Record<string, MintableStateItem>);
      dispatch(setMintableStates(newMintableStates));

      // Load content for the fetched transactions
      dispatch(loadContentForTransactions(fetchedTransactions));

    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
);

export const appendTransactions = createAsyncThunk(
  'contentDisplay/appendTransactions',
  async (arweaveIds: string[], { dispatch, getState }) => {
    try {
      const fetchedTransactions = await fetchTransactionsApi({
        nftIds: arweaveIds,
      });

      dispatch(addTransactions(fetchedTransactions));

      // Set initial mintable state for new transactions
      const state = getState() as { contentDisplay: { mintableState: Record<string, MintableStateItem> } };
      const currentMintableStates = state.contentDisplay.mintableState;
      const newMintableStates = fetchedTransactions.reduce((acc, transaction) => {
        if (!currentMintableStates[transaction.id]) {
          acc[transaction.id] = { mintable: false };
        }
        return acc;
      }, {} as Record<string, MintableStateItem>);
      dispatch(setMintableStates({ ...currentMintableStates, ...newMintableStates }));

      // Load content for the new transactions
      dispatch(loadContentForTransactions(fetchedTransactions));

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
    dispatch(setMintableStates({}));
    ContentService.clearCache();
  }
);
