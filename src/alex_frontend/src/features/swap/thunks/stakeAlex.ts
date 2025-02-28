import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { _SERVICE as _SERVICEALEX } from "../../../../../declarations/ALEX/ALEX.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { getActorSwap, getAlexActor } from "@/features/auth/utils/authUtils";
import { ErrorMessage, getErrorMessage } from "../utlis/erorrs";

// Define the async thunk
const stakeAlex = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  { amount: string; userPrincipal: string },
  { rejectValue: ErrorMessage }
>(
  "icp_swap/stakeAlex",
  async ({ amount, userPrincipal }, { rejectWithValue }) => {
    try {
      const actorAlex = await getAlexActor();
      const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
      let amountFormat: bigint = BigInt(
        Number(Number(amount) * 10 ** 8).toFixed(0)
      );

      const checkApproval = await actorAlex.icrc2_allowance({
        account: {
          owner: Principal.fromText(userPrincipal),
          subaccount: [],
        },
        spender: {
          owner: Principal.fromText(icp_swap_canister_id),
          subaccount: [],
        },
      });

      if (checkApproval.allowance < amountFormat) {
        const resultAlexApprove = await actorAlex.icrc2_approve({
          spender: {
            owner: Principal.fromText(icp_swap_canister_id),
            subaccount: [],
          },
          amount: amountFormat,
          fee: [],
          memo: [],
          from_subaccount: [],
          created_at_time: [],
          expected_allowance: [],
          expires_at: [],
        });
        if ("Err" in resultAlexApprove) {
          const error = resultAlexApprove.Err;
          let errorMessage = "Insufficent funds"; // Default error message
          if ("TemporarilyUnavailable" in error) {
            errorMessage = "Service is temporarily unavailable";
          }
          throw new Error(errorMessage);
        }
      }

      const actorSwap = await getActorSwap();
      const result = await actorSwap.stake_ALEX(amountFormat, []);
      console.log("result is is ",result);
      if ("Ok" in result) return "success";
      if ("Err" in result) {
        const errorMessage = getErrorMessage(result.Err);
        return rejectWithValue(errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue({ title: error.message, message: "" });
      }
    }
    return rejectWithValue({
      title: "An unknown error occurred while Staking",
      message: "",
    });
  }
);

export default stakeAlex;
