import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getActorEmporium,
  getIcrc7Actor,
} from "@/features/auth/utils/authUtils";
import { arweaveIdToNat, natToArweaveId } from "@/utils/id_convert";
import LedgerService from "@/utils/LedgerService";
import { Principal } from "@dfinity/principal";

const cancelListedNft = createAsyncThunk<
  string, // Success return type
  string,
  { rejectValue: string } // Reject type
>("emporium/cancelistedNft", async (nftArweaveId, { rejectWithValue }) => {
  try {
    const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;
    const actorEmporium = await getActorEmporium();
    const tokenId = arweaveIdToNat(nftArweaveId);

    const result = await actorEmporium.cancel_nft_listing(tokenId);

    // Handle success or error response
    if ("Ok" in result) {
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
});

export default cancelListedNft;
