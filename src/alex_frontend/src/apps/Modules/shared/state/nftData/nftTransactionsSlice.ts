/**
 * Redux slice specifically for managing NFT-related transactions and content.
 * 
 * This slice handles:
 * - NFT transaction state management
 * - NFT content data caching
 * - Loading states for NFT operations
 * - Error handling for NFT-related operations
 * 
 * Focused specifically on NFT functionality, providing a dedicated state
 * management solution for NFT-related features in the application.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Transaction } from '../../types/queries';
import { CachedContent, ContentUrlInfo } from '../../../LibModules/contentDisplay/types';

export interface ContentDataItem extends CachedContent {
  urls?: ContentUrlInfo;
}

interface NFTTransactionsState {
  transactions: Transaction[];
  contentData: Record<string, ContentDataItem>;
  loading: boolean;
  error: string | null;
}

const initialState: NFTTransactionsState = {
  transactions: [],
  contentData: {},
  loading: false,
  error: null
};

const nftTransactionsSlice = createSlice({
  name: 'nftTransactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    setContentData: (state, action: PayloadAction<{ id: string; content: ContentDataItem }>) => {
      const { id, content } = action.payload;
      state.contentData[id] = content;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.contentData = {};
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  setTransactions,
  setContentData,
  clearTransactions,
  setLoading,
  setError
} = nftTransactionsSlice.actions;

export default nftTransactionsSlice.reducer; 