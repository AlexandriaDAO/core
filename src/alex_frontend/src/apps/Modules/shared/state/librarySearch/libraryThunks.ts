import { createAsyncThunk } from '@reduxjs/toolkit';
import { togglePrincipal, setLoading } from './librarySlice';
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
  async (
    { start = 0, end = 20 }: { start?: number; end?: number },
    { getState, dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      
      const state = getState() as RootState;
      const selectedPrincipals = state.library.selectedPrincipals;
      const collection = state.library.collection;

      if (selectedPrincipals && selectedPrincipals.length > 0 && collection) {
        await dispatch(fetchTokensForPrincipal({
          principalId: selectedPrincipals[0],
          collection,
          range: { start, end }
        }));

        const currentState = getState() as RootState;
        
        const arweaveIds = Object.values(currentState.nftData.nfts)
          .filter(nft => 
            nft.principal === selectedPrincipals[0] && 
            nft.collection === collection
          )
          .map(nft => nft.arweaveId);

        const uniqueArweaveIds = [...new Set(arweaveIds)] as string[];
        await dispatch(updateTransactions(uniqueArweaveIds));
      }
      
      dispatch(setLoading(false));
    } catch (error) {
      console.error('Error in performSearch:', error);
      dispatch(setLoading(false));
      throw error;
    }
  }
);

export const toggleSort = () => (dispatch: AppDispatch) => {
  dispatch(toggleSortDirection());
};

