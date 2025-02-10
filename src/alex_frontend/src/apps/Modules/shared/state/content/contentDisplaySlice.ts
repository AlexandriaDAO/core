import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../../../shared/types/queries';
import { CachedContent, ContentUrlInfo } from '../../../LibModules/contentDisplay/types';

export interface ContentDataItem extends CachedContent {
  urls?: ContentUrlInfo;
}

interface ContentDisplayState {
  transactions: Transaction[];
  contentData: Record<string, ContentDataItem>;
  isAuthenticated?: boolean;
  isUpdated:boolean;
}

const initialState: ContentDisplayState = {
  transactions: [],
  contentData: {},
  isUpdated:false,
};

const contentDisplaySlice = createSlice({
  name: 'contentDisplay',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.isUpdated=!state.isUpdated;

    },

    removeTransactionById: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(
        (transaction) => transaction.id !== action.payload
      );
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload); 
    },
    commitAddTransaction: (state) => {
      state.isUpdated=!state.isUpdated;
    },

    clearTransactions: (state) => {
      state.transactions = [];
      state.isUpdated=!state.isUpdated;
    },
    setContentData: (state, action: PayloadAction<{ id: string; content: ContentDataItem }>) => {
      const { id, content } = action.payload;
      state.contentData[id] = content;
    },
    clearContentData: (state) => {
      state.contentData = {};
    },
    clearTransactionContent: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.contentData[id];
    },
  },
});

export const { 
  setTransactions, 
  clearTransactions, 
  setContentData,
  clearContentData,
  clearTransactionContent,
  removeTransactionById,
  addTransaction,
  commitAddTransaction
} = contentDisplaySlice.actions;
export default contentDisplaySlice.reducer;