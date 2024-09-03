import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import {_SERVICE as _SERVICEALEX} from "../../../../../declarations/ALEX/ALEX.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";

// Define the async thunk
const stakeAlex = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    actorAlex:ActorSubclass<_SERVICEALEX>;
    amount: string;
  },
  { rejectValue: string }
>("icp_swap/stakeAlex", async ({ actorSwap,actorAlex, amount }, { rejectWithValue }) => {
  try {
    const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
    let amountFormat: bigint = BigInt(Number(amount) * 10 ** 8);
    const resultAlexApprove =await actorAlex.icrc2_approve({
      spender: {
        owner: Principal.fromText(icp_swap_canister_id),
        subaccount: []
      },
      amount: amountFormat,
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      expected_allowance: [],
      expires_at: []
    });
    const result = await actorSwap.stake_ALEX(amountFormat);
    if ("Ok" in result) return "success";
    if ("Err" in result) throw new Error(result.Err);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while staking");
});

export default stakeAlex;
