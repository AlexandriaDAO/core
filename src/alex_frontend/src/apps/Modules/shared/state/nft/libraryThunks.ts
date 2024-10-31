import { createAsyncThunk } from '@reduxjs/toolkit';
import { Principal } from "@dfinity/principal";
import { icrc7 } from "../../../../../../../declarations/icrc7";
import { natToArweaveId } from "@/utils/id_convert";
import { togglePrincipal } from './librarySlice';
import { updateTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';

export const togglePrincipalSelection = createAsyncThunk(
  'library/togglePrincipalSelection',
  async (principalId: string, { dispatch, getState }) => {
    try {
      // Toggle the principal first
      dispatch(togglePrincipal(principalId));
      
      const state = getState() as RootState;
      const selectedPrincipals = state.library.selectedPrincipals;
      
      // Get all NFTs for currently selected principals
      const allArweaveIds = await Promise.all(
        selectedPrincipals.map(async (principalId) => {
          const principal = Principal.fromText(principalId);
          const nftIds = await icrc7.icrc7_tokens_of(
            { owner: principal, subaccount: [] },
            [], // A token id that it will start the search from.
            [BigInt(10000)]
          );
          console.log(nftIds);
          return nftIds.map(natToArweaveId);
        })
      );
      
      // Flatten the array of arrays into a single array of unique Arweave IDs
      const uniqueArweaveIds = [...new Set(allArweaveIds.flat())];
      
      // Update transactions with the complete set of Arweave IDs
      dispatch(updateTransactions(uniqueArweaveIds));
      
      return principalId;
    } catch (error) {
      console.error('Error in togglePrincipalSelection:', error);
      throw error;
    }
  }
);

