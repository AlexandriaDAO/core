import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
    setOwner: (state, action: PayloadAction<{ id: string; owner: string | null }>) => {
      const { id, owner } = action.payload;
      state.mintableState[id] = {
        ...state.mintableState[id],
        owner,
        mintable: true,
      };
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
  setOwner,
} = contentDisplaySlice.actions;
export default contentDisplaySlice.reducer;