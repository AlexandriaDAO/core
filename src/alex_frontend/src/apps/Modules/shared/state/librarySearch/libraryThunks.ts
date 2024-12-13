import { createAsyncThunk } from '@reduxjs/toolkit';
import { togglePrincipal } from './librarySlice';
import { updateTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';
import { toggleSortDirection } from './librarySlice';
import { AppDispatch } from '@/store';
import { fetchTokensForPrincipal } from '../nftData/nftDataThunks';

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
      
      // Get arweave IDs from the NFT data
      const arweaveIds = selectedPrincipals.flatMap(principal => 
        Object.values(currentState.nftData.nfts)
          .filter(nft => nft.principal === principal && nft.collection === collection)
          .map(nft => nft.arweaveId)
      );

      const uniqueArweaveIds = [...new Set(arweaveIds)] as string[];
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

