import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";

const unstake = createAsyncThunk<
  void,
  ActorSubclass<_SERVICESWAP>,
  { rejectValue: string }
>("stake/unstake", async (actor, { rejectWithValue }) => {
  try {
    // Execute unstake transaction
    const result = await actor.un_stake_all_ALEX([]);
    
    if ("Ok" in result) {
      // Success - return void
      return;
    }
    
    if ("Err" in result) {
      const error = result.Err;
      if ("InsufficientFunds" in error) {
        throw new Error("Insufficient funds to unstake");
      }
      if ("NoStake" in error) {
        throw new Error("No stake found to unstake");
      }
      if ("TemporarilyUnavailable" in error) {
        throw new Error("Unstake service is temporarily unavailable");
      }
      throw new Error("Unstake transaction failed");
    }

    throw new Error("Unexpected response from unstake transaction");
    
  } catch (error) {
    console.error("Error during unstake:", error);
    
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    
    return rejectWithValue("An unknown error occurred while unstaking");
  }
});

export default unstake;