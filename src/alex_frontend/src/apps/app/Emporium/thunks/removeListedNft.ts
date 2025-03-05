import { createAsyncThunk } from "@reduxjs/toolkit";
import { getActorEmporium } from "@/features/auth/utils/authUtils";
import { arweaveIdToNat } from "@/utils/id_convert";
import {
  removeTransaction,
  setTransactions,
} from "@/apps/Modules/shared/state/transactions/transactionSlice";

const removeListedNft = createAsyncThunk<
  string, // Success return type
  string,
  { rejectValue: string } // Reject type
>(
  "emporium/removeListedNft",
  async (nftArweaveId, { dispatch, rejectWithValue }) => {
    try {
      const actorEmporium = await getActorEmporium();
      const tokenId = arweaveIdToNat(nftArweaveId);
      const result = await actorEmporium.remove_nft_listing(tokenId);

      // Handle success or error response
      if ("Ok" in result) {
        dispatch(removeTransaction(nftArweaveId));
        return "success";
      } else if ("Err" in result) {
        return rejectWithValue(result?.Err); // Use rejectWithValue directly
      }
    } catch (error) {
      console.error("Error listing NFT:", error);
      return rejectWithValue(
        "An error occurred while canceling listed NFT." + error
      );
    }
    return rejectWithValue(
      "An unknown error occurred while canceling listed NFT. Please try again."
    );
  }
);

export default removeListedNft;
