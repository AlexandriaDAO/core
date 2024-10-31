import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from "@dfinity/principal";
import { icrc7 } from "../../../../../../../declarations/icrc7";
import { natToArweaveId } from "@/utils/id_convert";
import { addSelectedPrincipal, removeSelectedPrincipal, addSelectedArweaveIds, removeSelectedArweaveIds, togglePrincipal } from './librarySlice';
import { updateTransactions, appendTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';

export const togglePrincipalSelection = createAsyncThunk(
  'library/togglePrincipalSelection',
  async (principalId: string, { dispatch, getState }) => {
    try {
      dispatch(togglePrincipal(principalId));
      
      const state = getState() as RootState;
      const selectedPrincipals = state.library.selectedPrincipals;
      
      if (selectedPrincipals.includes(principalId)) {
        const principal = Principal.fromText(principalId);
        const nftIds = await icrc7.icrc7_tokens_of(
          { owner: principal, subaccount: [] },
          [],
          [BigInt(100)]
        );
        const arweaveIds = nftIds.map(natToArweaveId);
        dispatch(addSelectedArweaveIds(arweaveIds));
        dispatch(appendTransactions(arweaveIds));
      }
      
      return principalId;
    } catch (error) {
      console.error('Error in togglePrincipalSelection:', error);
      throw error;
    }
  }
);

