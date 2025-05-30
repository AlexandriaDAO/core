import { createAsyncThunk } from "@reduxjs/toolkit";
import { arweaveIdToNat } from "@/utils/id_convert";
import {
  removeTransaction,
  setTransactions,
} from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { _SERVICE as _SERVICE_EMPORIUM} from "../../../../../../declarations/emporium/emporium.did";
import { ActorSubclass } from "@dfinity/agent";

const removeListedNft = createAsyncThunk<
  string, // Success return type
  {
    actorEmporium: ActorSubclass<_SERVICE_EMPORIUM>,
    nftArweaveId: string,
  },
  { rejectValue: string } // Reject type
>(
  "emporium/removeListedNft",
  async ({ actorEmporium, nftArweaveId }, { dispatch, rejectWithValue }) => {
    try {
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
