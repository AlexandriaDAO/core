import { createAsyncThunk } from '@reduxjs/toolkit';
import { setNfts, setLoading, setError, NftData } from './nftDataSlice';
import { RootState } from '@/store';
import { icrc7 } from '../../../../../../../declarations/icrc7';
import { icrc7_scion } from '../../../../../../../declarations/icrc7_scion';
import { Principal } from '@dfinity/principal';

export const fetchTokensForPrincipal = createAsyncThunk(
  'nftData/fetchTokensForPrincipal',
  async (
    { principalId, collection }: { principalId: string; collection: 'icrc7' | 'icrc7_scion' },
    { dispatch, getState }
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const state = getState() as RootState;
      const existingNfts = Object.values(state.nftData.nfts)
        .filter(nft => nft.principal === principalId && nft.collection === collection);
      
      if (existingNfts?.length) {
        return existingNfts;
      }

      const principal = Principal.fromText(principalId);
      const params = { owner: principal, subaccount: [] as [] };
      const limit = [BigInt(10000)] as [bigint];

      let nftData: NftData[] = [];

      if (collection === 'icrc7') {
        const nftIds = await icrc7.icrc7_tokens_of(params, [], limit);
        nftData = nftIds.map(tokenId => ({
          tokenId: tokenId.toString(),
          collection: 'icrc7',
          nftType: 'og',
          principal: principalId
        }));
      } else if (collection === 'icrc7_scion') {
        const scionNftIds = await icrc7_scion.icrc7_tokens_of(params, [], limit);
        nftData = scionNftIds.map(tokenId => ({
          tokenId: tokenId.toString(),
          collection: 'icrc7_scion',
          nftType: 'scion',
          principal: principalId
        }));
      }
      
      dispatch(setNfts(nftData));
      
      return nftData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
