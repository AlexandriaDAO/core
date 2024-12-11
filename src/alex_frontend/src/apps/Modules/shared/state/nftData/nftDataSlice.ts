import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NftData {
  tokenId: string;
  collection: 'icrc7' | 'icrc7_scion';
  nftType: 'og' | 'scion';
  principal: string;
}

interface NftDataState {
  // TokenId -> NFT data
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
      action: PayloadAction<NftData[]>
    ) => {
      action.payload.forEach(nft => {
        state.nfts[nft.tokenId] = nft;
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setNfts, setLoading, setError } = nftDataSlice.actions;
export default nftDataSlice.reducer;
