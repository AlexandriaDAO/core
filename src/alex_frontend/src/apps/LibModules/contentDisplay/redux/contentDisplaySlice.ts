import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../../arweaveSearch/types/queries';

interface ContentDisplayState {
  transactions: Transaction[];
}

const initialState: ContentDisplayState = {
  transactions: [],
};

const contentDisplaySlice = createSlice({
  name: 'contentDisplay',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    clearTransactions: (state) => {
      state.transactions = [];
    },
    addTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = [...state.transactions, ...action.payload];
    },
  },
});

export const { setTransactions, clearTransactions, addTransactions } = contentDisplaySlice.actions;
export default contentDisplaySlice.reducer;


