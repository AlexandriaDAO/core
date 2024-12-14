import { createAsyncThunk } from '@reduxjs/toolkit';
import { setNfts, setLoading, setError, NftData, updateNftBalances } from './nftDataSlice';
import { RootState } from '@/store';
import { icrc7 } from '../../../../../../../declarations/icrc7';
import { icrc7_scion } from '../../../../../../../declarations/icrc7_scion';
import { nft_manager } from '../../../../../../../declarations/nft_manager';
import { ALEX } from '../../../../../../../declarations/ALEX';
import { LBRY } from '../../../../../../../declarations/LBRY';
import { Principal } from '@dfinity/principal';
import { natToArweaveId } from '@/utils/id_convert';

const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

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
      const existingNfts = Object.entries(state.nftData.nfts)
        .filter(([_, nft]) => nft.principal === principalId && nft.collection === collection);
      
      if (existingNfts?.length) {
        return existingNfts;
      }

      const principal = Principal.fromText(principalId);
      const params = { owner: principal, subaccount: [] as [] };
      const limit = [BigInt(10000)] as [bigint];

      let nftEntries: [string, NftData][] = [];

      if (collection === 'icrc7') {
        const nftIds = await icrc7.icrc7_tokens_of(params, [], limit);
        nftEntries = nftIds.map(tokenId => [
          tokenId.toString(),
          {
            collection: 'icrc7',
            principal: principalId,
            arweaveId: natToArweaveId(tokenId)
          }
        ]);
      } else if (collection === 'icrc7_scion') {
        const scionNftIds = await icrc7_scion.icrc7_tokens_of(params, [], limit);
        nftEntries = await Promise.all(
          scionNftIds.map(async (tokenId) => {
            const ogId = await nft_manager.scion_to_og_id(tokenId);
            return [
              tokenId.toString(),
              {
                collection: 'icrc7_scion',
                principal: principalId,
                arweaveId: natToArweaveId(ogId)
              }
            ];
          })
        );
      }
      
      dispatch(setNfts(nftEntries));

      // Fetch balances for each NFT
      await Promise.all(
        nftEntries.map(async ([tokenId]) => {
          const subaccount = await nft_manager.to_nft_subaccount(BigInt(tokenId));
          const balanceParams = {
            owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
            subaccount: [Array.from(subaccount)] as [number[]]
          };

          const [alexBalance, lbryBalance] = await Promise.all([
            ALEX.icrc1_balance_of(balanceParams),
            LBRY.icrc1_balance_of(balanceParams)
          ]);

          dispatch(updateNftBalances({
            tokenId,
            alex: alexBalance.toString(),
            lbry: lbryBalance.toString()
          }));
        })
      );
      
      return nftEntries;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
