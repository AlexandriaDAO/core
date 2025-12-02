import { createSlice } from '@reduxjs/toolkit';
import fetchTransactions from './thunks/fetchTransactions';

export interface TransactionType {
  type: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  timestamp: string;
}

export interface HistoryState {
  transactions: TransactionType[];
  loading: boolean;
  error: string | null;
  selectedTransaction: TransactionType | null;
}

const initialState: HistoryState = {
  transactions: [],
  loading: false,
  error: null,
  selectedTransaction: null
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setSelectedTransaction: (state, action) => {
      state.selectedTransaction = action.payload;
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch transaction history';
      });
  }
});

export const { setSelectedTransaction, clearSelectedTransaction } = historySlice.actions;
export default historySlice.reducer;