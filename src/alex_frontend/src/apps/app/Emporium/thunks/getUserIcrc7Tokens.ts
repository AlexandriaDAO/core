import { fetchTransactionsForAlexandrian } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { setTransactions } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { loadContentForTransactions } from "@/apps/Modules/shared/state/transactions/transactionThunks";
import { Principal } from "@dfinity/principal";
import { createAsyncThunk, AnyAction } from "@reduxjs/toolkit";
import { resetPagination } from "../emporiumSlice";
import { createTokenAdapter } from "@/apps/Modules/shared/adapters/TokenAdapter";

const getUserIcrc7Tokens = createAsyncThunk<
  { tokenId: string; arweaveId: string }[], // Return structure
  string, // Argument type
  { rejectValue: string }
>(
  "emporium/getUserIcrc7Tokens",
  async (userPrincipal, { rejectWithValue, dispatch }) => {
    try {
      // Clear transactions in the store
      dispatch(resetPagination());
      dispatch(setTransactions([]));

      // Create NFT token adapter
      const nftAdapter = createTokenAdapter('NFT');
      
      // Fetch the user's tokens using the adapter
      const result = await nftAdapter.getTokensOf(
        Principal.fromText(userPrincipal),
        undefined,
        undefined
      );

      if (result.length === 0) {
        console.warn("No tokens found for the specified user.");
        return [];
      }

      // Convert tokens to the required format using the adapter
      const tokens = await Promise.all(result.map(async (value) => {
        const nftData = await nftAdapter.tokenToNFTData(value, userPrincipal);
        return {
          tokenId: value.toString(),
          arweaveId: nftData.arweaveId,
        };
      }));

      // Extract arweaveIds for transactions
      const arweaveIds = tokens.map((token) => token.arweaveId);

      // Fetch and dispatch transaction data
      if (arweaveIds.length > 0) {
        const fetchedTransactions = await fetchTransactionsForAlexandrian(arweaveIds);
        
        dispatch(setTransactions(fetchedTransactions));
        await dispatch(loadContentForTransactions(fetchedTransactions) as unknown as AnyAction);
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
