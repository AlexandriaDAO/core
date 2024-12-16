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
}

const initialState: NftDataState = {
  nfts: {},
  loading: false,
  error: null,
};

const nftDataSlice = createSlice({
  name: 'nftData',
  initialState,
  reducers: {
    setNfts: (
      state,
      action: PayloadAction<[string, NftData][]>
    ) => {
      action.payload.forEach(([tokenId, nft]) => {
        state.nfts[tokenId] = nft;
      });
    },
    updateNftBalances: (
      state,
      action: PayloadAction<{ tokenId: string; alex: string; lbry: string }>
    ) => {
      const { tokenId, alex, lbry } = action.payload;
      if (state.nfts[tokenId]) {
        state.nfts[tokenId].alex = alex;
        state.nfts[tokenId].lbry = lbry;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearNfts: (state) => {
      state.nfts = {};
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setNfts, updateNftBalances, setLoading, setError, clearNfts } = nftDataSlice.actions;
export default nftDataSlice.reducer;
