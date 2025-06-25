import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent/lib/cjs";
import { _SERVICE as _SERVICE_LBRY } from "../../../../../../declarations/LBRY/LBRY.did";
import { _SERVICE as _SERVICE_SWAP } from "../../../../../../declarations/icp_swap/icp_swap.did";
import { RootState } from "@/store";

const burn = createAsyncThunk<
  void,
  {
    lbryActor: ActorSubclass<_SERVICE_LBRY>,
    swapActor: ActorSubclass<_SERVICE_SWAP>,
    amount: number;
  },
  { rejectValue: string, state: RootState }
>(
  "balance/lbry/burn",
  async ({ lbryActor, swapActor, amount }, { rejectWithValue, getState }) => {
    try {
      const {user} = getState().auth;
      if(!user?.principal) throw new Error('User is unauthenticated');
      const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
      let amountFormat: bigint = BigInt(Number(amount));
      let amountFormate8s: bigint = BigInt(Number(amount) * 10 ** 8);

      const checkApproval = await lbryActor.icrc2_allowance({
        account: {
          owner: Principal.fromText(user.principal),
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
          let errorMessage = "Unknown error";
          if ("TemporarilyUnavailable" in error) {
            errorMessage = "Service is temporarily unavailable";
          }
          throw new Error(errorMessage);
        }
      }

      const result = await swapActor.burn_LBRY(amountFormat, []);
      if ("Ok" in result) {
        return;
      } else if ("Err" in result) {
        return rejectWithValue(result.Err.toString());
      }
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
    }
    return rejectWithValue("An unknown error occurred while burning");
  }
);

export default burn;