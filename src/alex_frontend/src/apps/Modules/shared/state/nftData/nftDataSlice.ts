import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NFTData, NFTBalances } from '../../types/nft';

interface NFTDataState {
  nfts: Record<string, NFTData>;
  loading: boolean;
  error: string | null;
  totalNfts: number;
  cachedPages: Record<string, boolean>;
  arweaveToNftId: Record<string, string>;
}

const initialState: NFTDataState = {
  nfts: {},
  loading: false,
  error: null,
  totalNfts: 0,
  cachedPages: {},
  arweaveToNftId: {}
};

const nftDataSlice = createSlice({
  name: 'nftData',
  initialState,
  reducers: {
    setNFTs: (state, action: PayloadAction<Record<string, NFTData>>) => {
      state.nfts = { ...state.nfts, ...action.payload };
      // Update arweaveToNftId mapping
      Object.entries(action.payload).forEach(([tokenId, nft]) => {
        state.arweaveToNftId[nft.arweaveId] = tokenId;
      });
    },
    updateNftBalances: (state, action: PayloadAction<NFTBalances>) => {
      const { tokenId, alex, lbry } = action.payload;
      if (state.nfts[tokenId]) {
        state.nfts[tokenId].balances = { alex, lbry };
      }
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
    cachePage: (state, action: PayloadAction<string>) => {
      state.cachedPages[action.payload] = true;
    },
    clearCache: (state) => {
      state.cachedPages = {};
    },
    clearNfts: (state) => {
      state.nfts = {};
      state.arweaveToNftId = {};
      state.cachedPages = {};
      state.totalNfts = 0;
    },
    // Deprecated alias for clearNfts
    clearNFTs: (state) => {
      console.warn('Warning: clearNFTs is deprecated. Please use clearNfts instead.');
      state.nfts = {};
      state.arweaveToNftId = {};
      state.cachedPages = {};
      state.totalNfts = 0;
    }
  },
  extraReducers: (builder) => {
    // ... existing extra reducers
  }
});

export const { 
  setNFTs, 
  updateNftBalances,
  setLoading, 
  setError, 
  setTotalNfts, 
  cachePage,
  clearCache,
  clearNfts,
  clearNFTs // Include the deprecated version in exports
} = nftDataSlice.actions;

export default nftDataSlice.reducer;
