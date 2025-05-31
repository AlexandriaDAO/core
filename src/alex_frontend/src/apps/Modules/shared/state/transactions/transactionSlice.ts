/**
 * Unified transaction slice that replaces both contentDisplaySlice and nftTransactionsSlice
 */
import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import { Transaction } from '../../../shared/types/queries';
import { CachedContent, ContentUrlInfo } from '../../../LibModules/contentDisplay/types';

export interface ContentDataItem extends CachedContent {
  data?: Blob | any; // Allow for blob data
  source?: 'ic_canister' | 'arweave' | 'unknown'; // Source of the content
  contentType?: string; // Content type of the blob
  urls?: ContentUrlInfo;
}

interface TransactionState {
  transactions: Transaction[];
  arweaveTxCache: Record<string, Transaction>;
  contentData: Record<string, ContentDataItem>;
  loading: boolean;
  error: string | null;
  isUpdated: boolean;
}

const initialState: TransactionState = {
  transactions: [],
  arweaveTxCache: {},
  contentData: {},
  loading: false,
  error: null,
  isUpdated: false
};

// Create action creators for the external actions
export const setTransactions = createAction<Transaction[]>('transactions/setTransactions');
export const addTransaction = createAction<Transaction>('transactions/addTransaction');
export const removeTransaction = createAction<string>('transactions/removeTransaction');
export const clearTransactions = createAction('transactions/clearTransactions');
export const setContentData = createAction<{ id: string; content: ContentDataItem }>('transactions/setContentData');
export const clearContentData = createAction('transactions/clearContentData');
export const clearTransactionContent = createAction<string>('transactions/clearTransactionContent');
export const setLoading = createAction<boolean>('transactions/setLoading');
export const setError = createAction<string | null>('transactions/setError');
export const setArweaveTxsInCache = createAction<Record<string, Transaction>>('transactions/setArweaveTxsInCache');
export const setArweaveTxInCache = createAction<{ id: string; transaction: Transaction }>('transactions/setArweaveTxInCache');
export const clearArweaveTxCache = createAction('transactions/clearArweaveTxCache');

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // These methods are for direct dispatching from components if needed
    setTransactionsLocal: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.isUpdated = !state.isUpdated;
    },
    addTransactionLocal: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload);
      state.isUpdated = !state.isUpdated;
    },
    removeTransactionLocal: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(
        (transaction) => transaction.id !== action.payload
      );
    },
    clearTransactionsLocal: (state) => {
      state.transactions = [];
      state.isUpdated = !state.isUpdated;
    },
    setContentDataLocal: (state, action: PayloadAction<{ id: string; content: ContentDataItem }>) => {
      const { id, content } = action.payload;
      state.contentData[id] = content;
    },
    clearContentDataLocal: (state) => {
      state.contentData = {};
    },
    setLoadingLocal: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setErrorLocal: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setArweaveTxsInCacheLocal: (state, action: PayloadAction<Record<string, Transaction>>) => {
      state.arweaveTxCache = { ...state.arweaveTxCache, ...action.payload };
    },
    setArweaveTxInCacheLocal: (state, action: PayloadAction<{ id: string; transaction: Transaction }>) => {
      const { id, transaction } = action.payload;
      state.arweaveTxCache[id] = transaction;
    },
    clearArweaveTxCacheLocal: (state) => {
      state.arweaveTxCache = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle external action creators
      .addCase(setTransactions, (state, action) => {
        state.transactions = action.payload;
        state.isUpdated = !state.isUpdated;
      })
      .addCase(addTransaction, (state, action) => {
        state.transactions.push(action.payload);
        state.isUpdated = !state.isUpdated;
      })
      .addCase(removeTransaction, (state, action) => {
        state.transactions = state.transactions.filter(
          (transaction) => transaction.id !== action.payload
        );
      })
      .addCase(clearTransactions, (state) => {
        state.transactions = [];
        state.isUpdated = !state.isUpdated;
      })
      .addCase(setContentData, (state, action) => {
        const { id, content } = action.payload;
        state.contentData[id] = content;
      })
      .addCase(clearContentData, (state) => {
        state.contentData = {};
      })
      .addCase(clearTransactionContent, (state, action) => {
        // Remove the content for a specific transaction id
        const transactionId = action.payload;
        if (state.contentData[transactionId]) {
          delete state.contentData[transactionId];
        }
      })
      .addCase(setLoading, (state, action) => {
        state.loading = action.payload;
      })
      .addCase(setError, (state, action) => {
        state.error = action.payload;
      })
      .addCase(setArweaveTxsInCache, (state, action: PayloadAction<Record<string, Transaction>>) => {
        state.arweaveTxCache = { ...state.arweaveTxCache, ...action.payload };
      })
      .addCase(setArweaveTxInCache, (state, action: PayloadAction<{ id: string; transaction: Transaction }>) => {
        const { id, transaction } = action.payload;
        state.arweaveTxCache[id] = transaction;
      })
      .addCase(clearArweaveTxCache, (state) => {
        state.arweaveTxCache = {};
      });
  }
});

export const {
  setTransactionsLocal,
  addTransactionLocal,
  removeTransactionLocal,
  clearTransactionsLocal,
  setContentDataLocal,
  clearContentDataLocal,
  setLoadingLocal,
  setErrorLocal,
  setArweaveTxsInCacheLocal,
  setArweaveTxInCacheLocal,
  clearArweaveTxCacheLocal
} = transactionSlice.actions;

export default transactionSlice.reducer; 