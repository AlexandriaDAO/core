import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
const claimReward = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {
    actor: ActorSubclass<_SERVICESWAP>;
  },
  { rejectValue: string }
>("icp_swap/claimReward", async ({ actor }, { rejectWithValue }) => {
  try {
    const result = await actor.claim_icp_reward();
    if ("Ok" in result) return "success";
    if ("Err" in result) throw new Error(result.Err);
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while unstaking");
});

export default claimReward;
