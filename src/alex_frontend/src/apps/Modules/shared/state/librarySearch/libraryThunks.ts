import { createAsyncThunk } from '@reduxjs/toolkit';
import { togglePrincipal } from './librarySlice';
import { updateTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';
import { toggleSortDirection } from './librarySlice';
import { AppDispatch } from '@/store';
import { fetchTokensForPrincipal } from '../nftData/nftDataThunks';
import { natToArweaveId } from "@/utils/id_convert";
import { nft_manager } from '../../../../../../../declarations/nft_manager';
import { NftData } from '../nftData/nftDataSlice';

export const togglePrincipalSelection = createAsyncThunk(
  'library/togglePrincipalSelection',
  async (principalId: string, { dispatch }) => {
    try {
      dispatch(togglePrincipal(principalId));
      return principalId;
    } catch (error) {
      console.error('Error in togglePrincipalSelection:', error);
      throw error;
    }
  }
);

export const performSearch = createAsyncThunk(
  'library/performSearch',
  async (_, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const selectedPrincipals = state.library.selectedPrincipals;
      const collection = state.library.collection;

      // Fetch tokens for any principals that don't have data yet
      await Promise.all(
        selectedPrincipals.map(principal =>
          dispatch(fetchTokensForPrincipal({ principalId: principal, collection }))
        )
      );

      // Get the latest state after fetching
      const currentState = getState() as RootState;
      
      // Process NFTs based on their type
      const processedNftIds = await Promise.all(
        selectedPrincipals.flatMap(principal => {
          const nfts = Object.values(currentState.nftData.nfts)
            .filter(nft => nft.principal === principal && nft.collection === collection);
            
          return Promise.all(nfts.map(async (nft: NftData) => {
            if (nft.nftType === 'scion') {
              // Convert string back to BigInt for the API call
              const ogId = await nft_manager.scion_to_og_id(BigInt(nft.tokenId));
              return natToArweaveId(ogId);
            } else {
              return natToArweaveId(BigInt(nft.tokenId));
            }
          }));
        })
      );

      const uniqueArweaveIds = [...new Set(processedNftIds.flat())] as string[];
      dispatch(updateTransactions(uniqueArweaveIds));
      
      return uniqueArweaveIds;
    } catch (error) {
      console.error('Error in performSearch:', error);
      throw error;
    }
  }
);

export const toggleSort = () => (dispatch: AppDispatch) => {
  dispatch(toggleSortDirection());
};

