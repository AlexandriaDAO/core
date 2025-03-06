import { createAsyncThunk, AnyAction } from "@reduxjs/toolkit";
import {
  getActorEmporium,
  getIcpLedgerActor,
} from "@/features/auth/utils/authUtils";
import { arweaveIdToNat } from "@/utils/id_convert";
import { Principal } from "@dfinity/principal";
import { removeTransaction } from "@/apps/Modules/shared/state/transactions/transactionThunks";

const buyNft = createAsyncThunk<
  string, // Success return type
  {
    nftArweaveId: string;
    userPrincipal:string;
    price: string;
  },
  { rejectValue: string } // Reject type
>(
  "emporium/buyNft",
  async ({ nftArweaveId, price,userPrincipal }, { dispatch, rejectWithValue }) => {
    try {
      const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;
      const actorEmporium = await getActorEmporium();
      const actorIcpLedger = await getIcpLedgerActor();

      const tokenId = arweaveIdToNat(nftArweaveId);
      let amountFormatApprove: bigint = BigInt(
        Number((Number(price) + 0.0001) * 10 ** 8).toFixed(0)
      );
      const checkApproval = await actorIcpLedger.icrc2_allowance({
        account: {
          owner: Principal.fromText(userPrincipal),
          subaccount: [],
        },
        spender: {
          owner: Principal.fromText(emporium_canister_id),
          subaccount: [],
        },
      });

      if (checkApproval.allowance < amountFormatApprove) {
        const resultIcpApprove = await actorIcpLedger.icrc2_approve({
          spender: {
            owner: Principal.fromText(emporium_canister_id),
            subaccount: [],
          },
          amount: amountFormatApprove,
          fee: [BigInt(10000)],
          memo: [],
          from_subaccount: [],
          created_at_time: [],
          expected_allowance: [],
          expires_at: [],
        });
        if ("Err" in resultIcpApprove) {
          const error = resultIcpApprove.Err;
          let errorMessage = "Unknown error"; // Default error message
          if ("TemporarilyUnavailable" in error) {
            errorMessage = "Service is temporarily unavailable";
          }
          throw new Error(errorMessage);
        }
      }
      const result = await actorEmporium.buy_nft(tokenId);
      // Handle success or error response
      if ("Ok" in result) {
        dispatch(removeTransaction(nftArweaveId) as unknown as AnyAction);

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
