import { createAsyncThunk } from '@reduxjs/toolkit';
import { setTransactions, setContentData, setLoading, setError, clearTransactions } from './nftTransactionsSlice';
import { fetchTransactionsForAlexandrian } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import type { Transaction } from '../../types/queries';

export const fetchNFTTransactions = createAsyncThunk<
  Transaction[],
  string[],
  { rejectValue: string }
>(
  'nftTransactions/fetchNFTTransactions',
  async (arweaveIds: string[], { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Fetch transactions for the Arweave IDs
      const transactions = await fetchTransactionsForAlexandrian(arweaveIds);

      if (!transactions || transactions.length === 0) {
        console.warn('No transactions found for the NFTs');
        return rejectWithValue('No transactions found for the NFTs');
      }

      // Store the transactions in the slice
      dispatch(setTransactions(transactions));

      // Load content for each transaction
      await Promise.all(
        transactions.map(async (transaction) => {
          try {
            const content = await ContentService.loadContent(transaction);
            const urls = await ContentService.getContentUrls(transaction, content);
            
            dispatch(setContentData({
              id: transaction.id,
              content: {
                ...content,
                urls
              }
            }));
          } catch (error) {
            console.error(`Error loading content for transaction ${transaction.id}:`, error);
          }
        })
      );

      return transactions;
    } catch (error) {
      console.error('Error fetching NFT transactions:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);