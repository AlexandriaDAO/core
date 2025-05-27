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

interface UpdateNftAppearsInPayload {
  initiatingNftId: string; 
  arweaveId: string; 
  trueOriginalNumericId: string; 
  appearsIn: string[];
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
        if (nft.arweaveId) { // Ensure arweaveId exists
            state.arweaveToNftId[nft.arweaveId] = tokenId;
        }
      });
    },
    updateNftAppearsIn: (state, action: PayloadAction<UpdateNftAppearsInPayload>) => {
      const { arweaveId, appearsIn, trueOriginalNumericId, initiatingNftId } = action.payload;
      console.log(`[updateNftAppearsIn reducer] Called for arweaveId: ${arweaveId}, trueOriginalNumericId: ${trueOriginalNumericId}, initiatingNftId: ${initiatingNftId}, appearsIn:`, appearsIn);

      let foundMatch = false;
      Object.keys(state.nfts).forEach(key => {
        if (state.nfts[key].arweaveId === arweaveId) {
          foundMatch = true;
          // console.log(`[updateNftAppearsIn reducer] Updating appears_in for NFT key ${key} (ArweaveID: ${arweaveId}). Old:`, state.nfts[key].appears_in);
          state.nfts[key].appears_in = appearsIn;
        }
      });
      if (!foundMatch) {
        console.warn(`[updateNftAppearsIn reducer] No NFT found in state with arweaveId: ${arweaveId}. initiatingNftId: ${initiatingNftId}, trueOriginalNumericId: ${trueOriginalNumericId}`);
        // Fallback: if somehow no arweaveId match, update the initiatingNftId if it exists, 
        // and the trueOriginalNumericId if it exists, as a safety net.
        if (state.nfts[initiatingNftId]) {
            // console.log(`[updateNftAppearsIn reducer] Fallback: Updating appears_in for initiatingNftId ${initiatingNftId}`);
            state.nfts[initiatingNftId].appears_in = appearsIn;
        }
        if (trueOriginalNumericId && state.nfts[trueOriginalNumericId] && initiatingNftId !== trueOriginalNumericId) {
            // console.log(`[updateNftAppearsIn reducer] Fallback: Also updating appears_in for trueOriginalNumericId ${trueOriginalNumericId}`);
            state.nfts[trueOriginalNumericId].appears_in = appearsIn;
        }
      }
    },
    updateNftBalances: (state, action: PayloadAction<NFTBalances>) => {
      const { tokenId, alex, lbry } = action.payload;
      if (state.nfts[tokenId]) {
        state.nfts[tokenId].balances = { alex, lbry };
      }
    },
    updateNftRarityPercentage: (state, action: PayloadAction<{ nftId: string; rarityPercentage: number }>) => {
      const { nftId, rarityPercentage } = action.payload;
      if (state.nfts[nftId]) {
        state.nfts[nftId].rarityPercentage = rarityPercentage;
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
  updateNftAppearsIn,
  updateNftBalances,
  updateNftRarityPercentage,
  setLoading, 
  setError, 
  setTotalNfts, 
  cachePage,
  clearCache,
  clearNfts,
  clearNFTs // Include the deprecated version in exports
} = nftDataSlice.actions;

export default nftDataSlice.reducer;
