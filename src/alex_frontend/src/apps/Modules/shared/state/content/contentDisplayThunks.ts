import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  setTransactions, 
  clearTransactions,
  setMintableStates,
  setContentData,
  MintableStateItem 
} from './contentDisplaySlice';
import { fetchTransactionsApi } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { Transaction } from '../../../shared/types/queries';
import { getAuthClient } from "@/features/auth/utils/authUtils";
import { RootState } from '@/store';



export const loadContentForTransactions = createAsyncThunk(
  'contentDisplay/loadContent',
  async (transactions: Transaction[], { dispatch }) => {
    const client = await getAuthClient();
    const initialStates = ContentService.getInitialMintableStates(transactions);
    dispatch(setMintableStates(initialStates));
    console.log("client identity", client.getIdentity().getPrincipal().toString());

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
          dispatch(setMintableStates({ [transaction.id]: { mintable: false } }));
        }
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
      const state = getState() as RootState;
      const sortAsc = state.library.sortAsc;

      const fetchedTransactions = await fetchTransactionsApi({
        nftIds: arweaveIds,
      });

      // Apply sorting based on sortAsc
      const sortedTransactions = sortAsc 
        ? fetchedTransactions 
        : [...fetchedTransactions].reverse();

      dispatch(setTransactions(sortedTransactions));

      // Set initial mintable state for new transactions
      const newMintableStates = fetchedTransactions.reduce((acc, transaction) => {
        acc[transaction.id] = { mintable: false };
        return acc;
      }, {} as Record<string, MintableStateItem>);
      dispatch(setMintableStates(newMintableStates));

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