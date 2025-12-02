import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";

const claim = createAsyncThunk<
  void,
  { actor: ActorSubclass<_SERVICESWAP>, reward: number },
  { rejectValue: string }
>("stake/claim", async ({ actor, reward }, { rejectWithValue }) => {
  try {
    // Validate minimum reward amount
    const rewardAmount = reward;
    if (rewardAmount < 0.01) throw new Error("Must have at least 0.01 ICP reward to claim");

    // Execute claim transaction
    const result = await actor.claim_icp_reward([]);

    if ("Ok" in result) return;

    if ("Err" in result) {
      const error = result.Err;
      if ("InsufficientFunds" in error) throw new Error("Insufficient rewards to claim");
      if ("NoRewards" in error) throw new Error("No rewards available to claim");
      if ("TemporarilyUnavailable" in error) throw new Error("Claim service is temporarily unavailable");
      throw new Error("Claim transaction failed");
    }

    throw new Error("Unexpected response from claim transaction");
  } catch (error) {
    console.error("Error during claim:", error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An unknown error occurred while claiming reward");
  }
});

export default claim;