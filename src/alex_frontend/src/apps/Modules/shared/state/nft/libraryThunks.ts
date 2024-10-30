import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from "@dfinity/principal";
import { icrc7 } from "../../../../../../../declarations/icrc7";
import { natToArweaveId } from "@/utils/id_convert";
import { addSelectedPrincipal, removeSelectedPrincipal, addSelectedArweaveIds, removeSelectedArweaveIds } from './librarySlice';
import { updateTransactions, appendTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';

export const togglePrincipalSelection = createAsyncThunk(
  'library/togglePrincipalSelection',
  async (principalId: string, { dispatch, getState }) => {
    try {
      const state = getState() as RootState;
      const { selectedPrincipals } = state.library;
      
      const principal = Principal.fromText(principalId);
      const nftIds = await icrc7.icrc7_tokens_of(
        { owner: principal, subaccount: [] },
        [],
        [BigInt(100)]
      );
      const arweaveIds = nftIds.map(natToArweaveId);

      if (selectedPrincipals.includes(principalId)) {
        dispatch(removeSelectedPrincipal(principalId));
        dispatch(removeSelectedArweaveIds(arweaveIds));
        dispatch(updateTransactions(
          state.library.selectedArweaveIds.filter(id => !arweaveIds.includes(id))
        ));
      } else {
        dispatch(addSelectedPrincipal(principalId));
        dispatch(addSelectedArweaveIds(arweaveIds));
        dispatch(appendTransactions(arweaveIds));
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error toggling principal selection:", error);
      throw error;
    }
  }
);

