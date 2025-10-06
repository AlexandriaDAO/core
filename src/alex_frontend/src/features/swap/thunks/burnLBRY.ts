import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
// import getCanisterBal from "@/features/icp-ledger/thunks/getCanisterBal";
// import getCanisterArchivedBal from "./getCanisterArchivedBal";
import { ErrorMessage, getErrorMessage } from "../utlis/erorrs";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICE_LBRY } from "../../../../../declarations/LBRY/LBRY.did";
import { _SERVICE as _SERVICE_SWAP } from "../../../../../declarations/icp_swap/icp_swap.did";

// Define the async thunk
const burnLbry = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  { lbryActor: ActorSubclass<_SERVICE_LBRY>,swapActor: ActorSubclass<_SERVICE_SWAP>, amount: string; userPrincipal: string },
  { rejectValue: ErrorMessage }
>(
  "icp_swap/burnLBRY",
  async ({ lbryActor,swapActor, amount, userPrincipal }, { rejectWithValue }) => {
    try {
      const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
      let amountFormat: bigint = BigInt(Number(amount));
      let amountFormate8s: bigint = BigInt(Number(amount) * 10 ** 8);

      const checkApproval = await lbryActor.icrc2_allowance({
        account: {
          owner: Principal.fromText(userPrincipal),
          subaccount: [],
        },
        spender: {
          owner: Principal.fromText(icp_swap_canister_id),
          subaccount: [],
        },
      });
      if (checkApproval.allowance < amountFormate8s) {
        const resultLbryApprove = await lbryActor.icrc2_approve({
          spender: {
            owner: Principal.fromText(icp_swap_canister_id),
            subaccount: [],
          },
          amount: amountFormate8s,
          fee: [],
          memo: [],
          from_subaccount: [],
          created_at_time: [],
          expected_allowance: [],
          expires_at: [],
        });
        if ("Err" in resultLbryApprove) {
          const error = resultLbryApprove.Err;
          let errorMessage = "Unknown error"; // Default error message
          if ("TemporarilyUnavailable" in error) {
            errorMessage = "Service is temporarily unavailable";
          }

          throw new Error(errorMessage);
        }
      }

      const result = await swapActor.burn_LBRY(amountFormat, []);
      if ("Ok" in result) {
        return "success";
      } else if ("Err" in result) {
        const errorMessage = getErrorMessage(result.Err);
        return rejectWithValue(errorMessage);
      }
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        return rejectWithValue({ title: error.message, message: "" });
      }
    }
    return rejectWithValue({
      title: "An unknown error occurred while Burning",
      message: "",
    });
  }
);

export default burnLbry;
