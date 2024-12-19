import { fetchTransactionsApi } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { loadContentForTransactions } from "@/apps/Modules/shared/state/content/contentDisplayThunks";
import { getIcrc7Actor } from "@/features/auth/utils/authUtils";
import { natToArweaveId } from "@/utils/id_convert";
import { Principal } from "@dfinity/principal";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getUserIcrc7Tokens = createAsyncThunk<
  { tokenId: string; arweaveId: string }[], // Return structure
  string, // Argument type
  { rejectValue: string }
>(
  "emporium/getUserIcrc7Tokens",
  async (userPrincipal, { rejectWithValue, dispatch }) => {
    try {
      // Clear transactions in the store
      dispatch(setTransactions([]));

      // Fetch the user's tokens
      const actorIcrc7 = await getIcrc7Actor();
      const result = await actorIcrc7.icrc7_tokens_of(
        {
          owner: Principal.fromText(userPrincipal),
          subaccount: [],
        },
        [],
        []
      );

      if (!Array.isArray(result) || result.length === 0) {
        console.warn("No tokens found for the specified user.");
        return [];
      }

      const tokens = result.map((value) => ({
        tokenId: value.toString(),
        arweaveId: natToArweaveId(value),
      }));

      // Extract arweaveIds for transactions
      const arweaveIds = tokens.map((token) => token.arweaveId);

      // Fetch and dispatch transaction data
      if (arweaveIds.length > 0) {
        const fetchedTransactions = await fetchTransactionsApi({
          nftIds: arweaveIds,
        });
        dispatch(setTransactions(fetchedTransactions));
        await dispatch(loadContentForTransactions(fetchedTransactions));
      }

      return tokens;
    } catch (error) {
      console.error("Error fetching ICRC7 tokens:", error);
      return rejectWithValue(
        "An unknown error occurred while fetching ICRC7 tokens"
      );
    }
  }
);
export default getUserIcrc7Tokens;
