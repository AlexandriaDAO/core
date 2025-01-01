import { createAsyncThunk } from "@reduxjs/toolkit";
import { getActorEmporium } from "@/features/auth/utils/authUtils";
import { arweaveIdToNat } from "@/utils/id_convert";

const editListing = createAsyncThunk<
  { nftArweaveId: string; price: string }, // Success return type
  {
    nftArweaveId: string;
    price: string;
  },
  { rejectValue: string } // Reject type
>(
  "emporium/editListing",
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
        return { nftArweaveId, price };
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

export default editListing;
