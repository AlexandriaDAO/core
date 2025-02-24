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
  collection: 'NFT' | 'SBT';
  principalId: string;
}

const fetchNFTBatch = async (params: BatchFetchParams[]) => {
  const batchSize = 10;
  const results: [string, NFTData][] = [];
  
  for (let i = 0; i < params.length; i += batchSize) {
    const batch = params.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async ({ tokenId, collection, principalId }) => {
        if (collection === 'NFT') {
          return [
            tokenId.toString(),
            {
              collection: 'NFT',
              principal: principalId,
              arweaveId: natToArweaveId(tokenId)
            }
          ] as [string, NFTData];
        } else {
          const ogId = await nft_manager.scion_to_og_id(tokenId);
          return [
            tokenId.toString(),
            {
              collection: 'SBT',
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
  collection: 'NFT' | 'SBT';
  page: number;
  itemsPerPage: number;
  startFromEnd?: boolean; // Optional parameter to start from end of supply
}

export const fetchTokensForPrincipal = createAsyncThunk<
  Record<string, NFTData>,
  FetchTokensParams,
  { state: RootState }
>(
  'nftData/fetchTokensForPrincipal',
  async (
    { principalId, collection, page, itemsPerPage, startFromEnd = true }, // Default to true to show newest first
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      dispatch(setNoResults(false));
      
      let allNftIds: bigint[] = [];
      let totalCount: bigint = BigInt(0);
      
      if (principalId === 'new') {
        // For 'new' option, get total supply first
        totalCount = await (collection === 'NFT' ? icrc7.icrc7_total_supply() : icrc7_scion.icrc7_total_supply());
        
        // Calculate the start index based on whether we want newest or oldest first
        let start: number;
        if (startFromEnd) {
          // Start from end to get newest first
          start = Number(totalCount) - (page * itemsPerPage);
          start = Math.max(0, start); // Don't go below 0
        } else {
          // Start from beginning to get oldest first
          start = (page - 1) * itemsPerPage;
        }
        
        const adjustedTake = Math.min(itemsPerPage, Number(totalCount) - start);
        
        // Get paginated results
        if (collection === 'NFT') {
          allNftIds = await icrc7.icrc7_tokens([BigInt(start)], [BigInt(adjustedTake)]);
        } else {
          allNftIds = await icrc7_scion.icrc7_tokens([BigInt(start)], [BigInt(adjustedTake)]);
        }
        
        // Only reverse if we're getting newest first
        if (startFromEnd) {
          allNftIds = allNftIds.reverse();
        }
      } else {
        const principal = Principal.fromText(principalId);
        const params = { owner: principal, subaccount: [] as [] };
        
        // For user-specific queries, get all tokens
        if (collection === 'NFT') {
          allNftIds = await icrc7.icrc7_tokens_of(params, [] as [], [] as []);
        } else {
          allNftIds = await icrc7_scion.icrc7_tokens_of(params, [] as [], [] as []);
        }
        
        totalCount = BigInt(allNftIds.length);

        // For user-specific queries, we can just slice the array appropriately
        if (startFromEnd) {
          allNftIds = allNftIds.reverse();
        }
        
        const start = (page - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, allNftIds.length);
        allNftIds = allNftIds.slice(start, end);
      }

      // Set no results state if the search returned empty
      if (allNftIds.length === 0) {
        dispatch(setNoResults(true));
      }

      dispatch(setTotalNfts(Number(totalCount)));
      
      // Prepare batch params
      const batchParams = allNftIds.map(tokenId => ({
        tokenId,
        collection,
        principalId: principalId === 'new' ? '' : principalId
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
