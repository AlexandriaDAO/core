import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ErrorMessage, getErrorMessage } from "../utlis/erorrs";

// Define the async thunk
const claimReward = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  { actor: ActorSubclass<_SERVICESWAP>, reward: string },
  { rejectValue: ErrorMessage }
>("icp_swap/claimReward", async ({ actor, reward }, { rejectWithValue }) => {
  try {
    if (Number(reward) < 0.01) {
      return rejectWithValue({title:"Must have at least 0.01 ICP reward to claim!",message:""});
    }
    const result = await actor.claim_icp_reward([]);
    if ("Ok" in result) return "success";
    else if ("Err" in result) {
      const errorMessage = getErrorMessage(result.Err);
      return rejectWithValue(errorMessage);
    }
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return rejectWithValue({title:error.message,message:""});
    }
  }
  return rejectWithValue({title:"An unknown error occurred while unstaking",message:""});
});

export default claimReward;
