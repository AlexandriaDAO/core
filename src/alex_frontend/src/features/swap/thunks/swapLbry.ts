import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import {
  getActorSwap,
  getIcpLedgerActor,
} from "@/features/auth/utils/authUtils";
import { ErrorMessage, getErrorMessage } from "../utlis/erorrs";
// Define the async thunk
const swapLbry = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  { amount: string; userPrincipal: string },
  { rejectValue: ErrorMessage }
>(
  "icp_swap/swapLbry",
  async ({ amount, userPrincipal }, { rejectWithValue }) => {
    try {
      const actorSwap = await getActorSwap();
      const actorIcpLedger = await getIcpLedgerActor();
      let amountFormat: bigint = BigInt(
        Number(Number(amount) * 10 ** 8).toFixed(0)
      );
      let amountFormatApprove: bigint = BigInt(
        Number((Number(amount) + 0.0001) * 10 ** 8).toFixed(0)
      );

      const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
      const checkApproval = await actorIcpLedger.icrc2_allowance({
        account: {
          owner: Principal.fromText(userPrincipal),
          subaccount: [],
        },
        spender: {
          owner: Principal.fromText(icp_swap_canister_id),
          subaccount: [],
        },
      });
      if (checkApproval.allowance < amountFormatApprove) {
        const resultIcpApprove = await actorIcpLedger.icrc2_approve({
          spender: {
            owner: Principal.fromText(icp_swap_canister_id),
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

      const result = await actorSwap.swap(amountFormat, []);
      if ("Ok" in result) return "success";
      if ("Err" in result) {
        const errorMessage = getErrorMessage(result.Err);
        return rejectWithValue(errorMessage);
      }
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        return rejectWithValue({title:error.message,message:""});
      }
    }
    return rejectWithValue({title:"An unknown error occurred while Swaping",message:""});
  }
);

export default swapLbry;
