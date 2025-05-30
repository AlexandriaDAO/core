import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { ErrorMessage, getErrorMessage } from "../utlis/erorrs";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICE_ICP_SWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { _SERVICE as _SERVICE_ICP_LEDGER } from "../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";

// Define the async thunk
const swapLbry = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  { actorSwap: ActorSubclass<_SERVICE_ICP_SWAP>, actorIcpLedger: ActorSubclass<_SERVICE_ICP_LEDGER>, amount: string, userPrincipal: string },
  { rejectValue: ErrorMessage }
>(
  "icp_swap/swapLbry",
  async ({ actorSwap, actorIcpLedger, amount, userPrincipal }, { rejectWithValue }) => {
    try {
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
