import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NftData {
  collection: 'icrc7' | 'icrc7_scion';
  principal: string;
  arweaveId: string;
  alex?: string;
  lbry?: string;
}

interface NftDataState {
  nfts: Record<string, NftData>;
  loading: boolean;
  error: string | null;
  totalNfts: number;
}

const initialState: NftDataState = {
  nfts: {},
  loading: false,
  error: null,
  totalNfts: 0
};

const nftDataSlice = createSlice({
  name: 'nftData',
  initialState,
  reducers: {
    setNfts: (state, action: PayloadAction<[string, NftData][]>) => {
      // Clear existing NFTs before setting new ones for pagination
      state.nfts = {};
      action.payload.forEach(([id, data]) => {
        state.nfts[id] = data;
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTotalNfts: (state, action: PayloadAction<number>) => {
      state.totalNfts = action.payload;
    },
    updateNftBalances: (state, action: PayloadAction<{ tokenId: string; alex: string; lbry: string }>) => {
      const { tokenId, alex, lbry } = action.payload;
      if (state.nfts[tokenId]) {
        state.nfts[tokenId] = {
          ...state.nfts[tokenId],
          alex,
          lbry
        };
      }
    },
    clearNfts: (state) => {
      state.nfts = {};
      state.loading = false;
      state.error = null;
      state.totalNfts = 0;
    }
  }
});

export const { 
  setNfts, 
  setLoading, 
  setError, 
  setTotalNfts, 
  updateNftBalances,
  clearNfts 
} = nftDataSlice.actions;

export default nftDataSlice.reducer;
