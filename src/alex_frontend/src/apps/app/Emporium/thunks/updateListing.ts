import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getActorEmporium,
  getIcrc7Actor,
} from "@/features/auth/utils/authUtils";
import { arweaveIdToNat, natToArweaveId } from "@/utils/id_convert";

const updateListing = createAsyncThunk<
  string, // Success return type
  {
    nftArweaveId: string;
    price: string;
  },
  { rejectValue: string } // Reject type
>(
  "emporium/updateListing",
  async ({ nftArweaveId, price }, { rejectWithValue }) => {
    try {
      const actorEmporium = await getActorEmporium();
      const tokenId = arweaveIdToNat(nftArweaveId);

      // Format the price as BigInt
      const priceFormat: bigint = BigInt(
        Math.round(Number(price) * 10 ** 8) // Convert to fixed-point format
      );
      const result = await actorEmporium.update_nft_price(tokenId, priceFormat);

      // Handle success or error response
      if ("Ok" in result) {
        return "success";
      } else if ("Err" in result) {
        return rejectWithValue(result?.Err); // Use rejectWithValue directly
      }
    } catch (error) {
      return rejectWithValue(
        "An error occurred while updating the NFT." + error
      );
    }
    return rejectWithValue(
      "An unknown error occurred while updating the NFT. Please try again."
    );
  }
);

export default updateListing;
