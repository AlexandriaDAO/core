import { createAsyncThunk, AnyAction } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { removeTransaction } from "@/apps/Modules/shared/state/transactions/transactionThunks";
import { createTokenAdapter } from "@/apps/Modules/shared/adapters/TokenAdapter";
import { _SERVICE as _SERVICE_EMPORIUM} from "../../../../../../declarations/emporium/emporium.did";
import { _SERVICE as _SERVICE_ICRC7} from "../../../../../../declarations/icrc7/icrc7.did";
import { ActorSubclass } from "@dfinity/agent";

const listNft = createAsyncThunk<
  string, // Success return type
  {
    actorEmporium: ActorSubclass<_SERVICE_EMPORIUM>,
    actorIcrc7: ActorSubclass<_SERVICE_ICRC7>,
    nftArweaveId: string;
    price: string;
  },
  { rejectValue: string } // Reject type
>(
  "emporium/listNft",
  async ({ actorEmporium, actorIcrc7, nftArweaveId, price }, { dispatch, rejectWithValue }) => {
    try {
      const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;
      
      const nftAdapter = createTokenAdapter('NFT');
      
      const { arweaveIdToNat } = await import("@/utils/id_convert");
      const tokenId = arweaveIdToNat(nftArweaveId);

      const priceFormat: bigint = BigInt(
        Math.round(Number(price) * 10 ** 8)
      );

      const isApproved = await actorIcrc7.icrc37_is_approved([
        {
          token_id: tokenId,
          from_subaccount: [],
          spender: {
            owner: Principal.fromText(emporium_canister_id),
            subaccount: [],
          },
        },
      ]);

      if (isApproved[0] === false) {
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
        if ("Err" in resultApproveIcrc7) {
          return "Approval failed!";
        }
      }
      const result = await actorEmporium.list_nft(tokenId, priceFormat);

      if ("Ok" in result) {
        dispatch(removeTransaction(nftArweaveId) as unknown as AnyAction);

        return "success";
      } else if ("Err" in result) {
        return rejectWithValue(result?.Err);
      }
    } catch (error) {
      console.error("Error listing NFT:", error);

      return rejectWithValue(
        "An error occurred while listing the NFT." + error
      );
    }
    return rejectWithValue(
      "An unknown error occurred while listing the NFT. Please try again."
    );
  }
);

export default listNft;
