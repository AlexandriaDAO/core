import { createAsyncThunk } from "@reduxjs/toolkit";
import { arweaveIdToNat } from "@/utils/id_convert";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICE_EMPORIUM} from "../../../../../../declarations/emporium/emporium.did";

const editListing = createAsyncThunk<
  { nftArweaveId: string; price: string }, // Success return type
  {
    actorEmporium: ActorSubclass<_SERVICE_EMPORIUM>,
    nftArweaveId: string;
    price: string;
  },
  { rejectValue: string } // Reject type
>(
  "emporium/editListing",
  async ({ actorEmporium, nftArweaveId, price }, { rejectWithValue }) => {
    try {
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
