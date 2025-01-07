import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  setNFTs as setNfts,
  updateNftBalances,
  setLoading,
  setError,
  setTotalNfts
} from './nftDataSlice';
import { RootState } from '@/store';
import { icrc7 } from '../../../../../../../declarations/icrc7';
import { icrc7_scion } from '../../../../../../../declarations/icrc7_scion';
import { nft_manager } from '../../../../../../../declarations/nft_manager';
import { ALEX } from '../../../../../../../declarations/ALEX';
import { LBRY } from '../../../../../../../declarations/LBRY';
import { Principal } from '@dfinity/principal';
import { natToArweaveId } from '@/utils/id_convert';
import type { NFTData } from '../../types/nft';
import { setNoResults } from '../librarySearch/librarySlice';

const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

// Add this interface for the batch function
interface BatchFetchParams {
  tokenId: bigint;
  collection: 'icrc7' | 'icrc7_scion';
  principalId: string;
}

const fetchNFTBatch = async (params: BatchFetchParams[]) => {
  const batchSize = 10;
  const results: [string, NFTData][] = [];
  
  for (let i = 0; i < params.length; i += batchSize) {
    const batch = params.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async ({ tokenId, collection, principalId }) => {
        if (collection === 'icrc7') {
          return [
            tokenId.toString(),
            {
              collection: 'icrc7',
              principal: principalId,
              arweaveId: natToArweaveId(tokenId)
            }
          ] as [string, NFTData];
        } else {
          const ogId = await nft_manager.scion_to_og_id(tokenId);
          return [
            tokenId.toString(),
            {
              collection: 'icrc7_scion',
              principal: principalId,
              arweaveId: natToArweaveId(ogId)
            }
          ] as [string, NFTData];
        }
      })
    );
    results.push(...batchResults);
  }
  
  return results;
};

// Export the interface so it can be imported by other files
export interface FetchTokensParams {
  principalId: string;
  collection: 'icrc7' | 'icrc7_scion';
  range?: { start: number; end: number };
}

export const fetchTokensForPrincipal = createAsyncThunk<
  Record<string, NFTData>,
  FetchTokensParams,
  { state: RootState }
>(
  'nftData/fetchTokensForPrincipal',
  async (
    { principalId, collection, range = { start: 0, end: 20 } },
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      dispatch(setNoResults(false));
      
      const principal = Principal.fromText(principalId);
      const params = { owner: principal, subaccount: [] as [] };
      // First get total count with a large limit
      const countLimit = [BigInt(10000)] as [bigint];

      let allNftIds: bigint[] = [];
      if (collection === 'icrc7') {
        allNftIds = await icrc7.icrc7_tokens_of(params, [], countLimit);
      } else if (collection === 'icrc7_scion') {
        allNftIds = await icrc7_scion.icrc7_tokens_of(params, [], countLimit);
      }

      // Set no results state if the search returned empty
      if (allNftIds.length === 0) {
        dispatch(setNoResults(true));
      }

      // Store total count
      dispatch(setTotalNfts(allNftIds.length));

      // Reverse the array to show newest NFTs first
      allNftIds = allNftIds.reverse();

      // Get the slice for the current page
      const pageNftIds = allNftIds.slice(range.start, range.end);
      
      // Prepare batch params
      const batchParams = pageNftIds.map(tokenId => ({
        tokenId,
        collection,
        principalId
      }));

      // Use batched fetching
      const nftEntries = await fetchNFTBatch(batchParams);
      
      const nftRecord = Object.fromEntries(nftEntries);
      dispatch(setNfts(nftRecord));

      // Fetch balances for the current page
      const convertE8sToToken = (e8sAmount: bigint): string => {
        return (Number(e8sAmount) / 1e8).toString();
      };

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
            alex: convertE8sToToken(alexBalance),
            lbry: convertE8sToToken(lbryBalance)
          }));
        })
      );
      
      return nftRecord;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
