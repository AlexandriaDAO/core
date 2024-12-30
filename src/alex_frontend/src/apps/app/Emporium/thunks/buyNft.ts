import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getActorEmporium,
  getIcpLedgerActor,
  getIcrc7Actor,
} from "@/features/auth/utils/authUtils";
import { arweaveIdToNat, natToArweaveId } from "@/utils/id_convert";
import { Principal } from "@dfinity/principal";
import { removeTransactionById } from "@/apps/Modules/shared/state/content/contentDisplaySlice";

const buyNft = createAsyncThunk<
  string, // Success return type
  {
    nftArweaveId: string;
    price: string;
  },
  { rejectValue: string } // Reject type
>(
  "emporium/buyNft",
  async ({ nftArweaveId, price }, { dispatch, rejectWithValue }) => {
    try {
      const actorEmporium = await getActorEmporium();

      const tokenId = arweaveIdToNat(nftArweaveId);
      
      const result = await actorEmporium.buy_nft(tokenId);
      // Handle success or error response
      if ("Ok" in result) {
        dispatch(removeTransactionById(nftArweaveId));

        return "success";
      } else if ("Err" in result) {
        return rejectWithValue(result?.Err); // Use rejectWithValue directly
      }
    } catch (error) {
      console.error("Error buying NFT:", error);
      return rejectWithValue("An error occurred while buying the NFT." + error);
    }
    return rejectWithValue(
      "An unknown error occurred while buying the NFT. Please try again."
    );
  }
);

export default buyNft;
