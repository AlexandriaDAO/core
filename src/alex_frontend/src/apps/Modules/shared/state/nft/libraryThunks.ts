import { createAsyncThunk } from '@reduxjs/toolkit';
import { getNftOwner } from '../../hooks/getNftOwner';
import { togglePrincipal } from './librarySlice';
import { updateTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';
import { toggleSortDirection } from './librarySlice';
import { AppDispatch } from '@/store';

export const togglePrincipalSelection = createAsyncThunk(
  'library/togglePrincipalSelection',
  async ({ principalId, collection }: { principalId: string, collection: string }, { dispatch, getState }) => {
    try {
      dispatch(togglePrincipal(principalId));
      
      const state = getState() as RootState;
      const selectedPrincipals = state.library.selectedPrincipals;
      const { getTokensForPrincipal } = getNftOwner();
      
      const allArweaveIds = await Promise.all(
        selectedPrincipals.map(principal => getTokensForPrincipal(principal, collection))
      );
      
      const uniqueArweaveIds = [...new Set(allArweaveIds.flat())];
      dispatch(updateTransactions(uniqueArweaveIds));
      
      return principalId;
    } catch (error) {
      console.error('Error in togglePrincipalSelection:', error);
      throw error;
    }
  }
);

export const toggleSort = () => (dispatch: AppDispatch) => {
  dispatch(toggleSortDirection());
};

