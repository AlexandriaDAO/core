import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Transaction } from '../../../shared/types/queries';
import { CachedContent, ContentUrlInfo } from '../../../LibModules/contentDisplay/types';

export interface MintableStateItem {
  mintable: boolean;
  owner?: string | null;
}

export interface ContentDataItem extends CachedContent {
  urls?: ContentUrlInfo;
}

interface ContentDisplayState {
  transactions: Transaction[];
  mintableState: Record<string, MintableStateItem>;
  contentData: Record<string, ContentDataItem>;
  isAuthenticated?: boolean;
}

const initialState: ContentDisplayState = {
  transactions: [],
  mintableState: {},
  contentData: {},
};

const contentDisplaySlice = createSlice({
  name: 'contentDisplay',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    removeTransactionById: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(
        (transaction) => transaction.id !== action.payload
      );
    },
    clearTransactions: (state) => {
      state.transactions = [];
    },
    setMintableStates: (state, action: PayloadAction<Record<string, MintableStateItem>>) => {
      state.mintableState = { ...state.mintableState, ...action.payload };
    },
    resetMintableState(state) {
      state.mintableState = {};
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
  setMintableStates,
  resetMintableState,
  setContentData,
  clearContentData,
  clearTransactionContent,
  removeTransactionById
} = contentDisplaySlice.actions;
export default contentDisplaySlice.reducer;