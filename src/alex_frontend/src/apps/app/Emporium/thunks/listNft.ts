import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getActorEmporium,
  getIcrc7Actor,
} from "@/features/auth/utils/authUtils";
import { arweaveIdToNat, natToArweaveId } from "@/utils/id_convert";
import LedgerService from "@/utils/LedgerService";
import { Principal } from "@dfinity/principal";

const listNft = createAsyncThunk<
  string, // Success return type
  {
    nftArweaveId: string;
    price: string;
  },
  { rejectValue: string } // Reject type
>("emporium/listNft", async ({ nftArweaveId, price }, { rejectWithValue }) => {
  try {
    const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;
    const actorEmporium = await getActorEmporium();
    const actorIcrc7 = await getIcrc7Actor();
    const tokenId = arweaveIdToNat(nftArweaveId);

    // Format the price as BigInt
    const priceFormat: bigint = BigInt(
      Math.round(Number(price) * 10 ** 8) // Convert to fixed-point format
    );

    const resultApproveIcrc7 = await actorIcrc7.icrc37_approve_tokens([
      {
        token_id: tokenId,
        approval_info: {
          memo: [],
          from_subaccount: [],
          created_at_time: [],
          expires_at: [],
          spender: {
            owner: Principal.fromText(emporium_canister_id),
            subaccount: [],
          },
        },
      },
    ]);

    const result = await actorEmporium.list_nft(tokenId, priceFormat);

    // Handle success or error response
    if ("Ok" in result) {
      return "success";
    } else if ("Err" in result) {
      const revoke = await actorIcrc7.icrc37_revoke_token_approvals([
        {
          token_id: tokenId,
          memo: [],
          from_subaccount: [],
          created_at_time: [],
          spender: [],
        },
      ]);
      return rejectWithValue(result?.Err); // Use rejectWithValue directly
    }
  } catch (error) {
    console.error("Error listing NFT:", error);

    return rejectWithValue("An error occurred while listing the NFT." + error);
  }
  // Fallback for unknown issues
  return rejectWithValue(
    "An unknown error occurred while listing the NFT. Please try again."
  );
});

export default listNft;
