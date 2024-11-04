import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from "@dfinity/principal";
import { icrc7 } from "../../../../../../../declarations/icrc7";
import { natToArweaveId } from "@/utils/id_convert";
import { togglePrincipal } from './librarySlice';
import { updateTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';
import { toggleSortDirection } from './librarySlice';
import { AppDispatch } from '@/store';

export const togglePrincipalSelection = createAsyncThunk(
  'library/togglePrincipalSelection',
  async (principalId: string, { dispatch, getState }) => {
    try {
      dispatch(togglePrincipal(principalId));
      
      const state = getState() as RootState;
      const selectedPrincipals = state.library.selectedPrincipals;
      
      const allArweaveIds = await Promise.all(
        selectedPrincipals.map(async (principalId) => {
          const principal = Principal.fromText(principalId);
          const nftIds = await icrc7.icrc7_tokens_of(
            { owner: principal, subaccount: [] },
            [],
            [BigInt(10000)]
          );
          return nftIds.map(natToArweaveId);
        })
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

