import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import LedgerService from "@/utils/LedgerService";
import { getActorSwap, getLbryActor } from "@/features/auth/utils/authUtils";
import getCanisterBal from "@/features/icp-ledger/thunks/getCanisterBal";
import getCanisterArchivedBal from "./getCanisterArchivedBal";

// Define the async thunk
const burnLbry = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  { amount: string; userPrincipal: string },
  { rejectValue: string }
>("icp_swap/burnLBRY", async ({amount,userPrincipal}, { dispatch, rejectWithValue }) => {
  try {
    const actorLbry = await getLbryActor();
    const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
    let amountFormat: bigint = BigInt(Number(amount));
    let amountFormate8s: bigint = BigInt(Number(amount) * 10 ** 8);

    const checkApproval = await actorLbry.icrc2_allowance({
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
      const resultLbryApprove = await actorLbry.icrc2_approve({
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


    const actorSwap = await getActorSwap();
    const result = await actorSwap.burn_LBRY(amountFormat, []);
    if ("Ok" in result) {
      dispatch(getCanisterBal());
      dispatch(getCanisterArchivedBal());
      return "success";
    } else if ("Err" in result) throw new Error(result.Err);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while burning LBRY");
});

export default burnLbry;
