import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { ActorSubclass } from "@dfinity/agent";
import { createAsyncThunk } from "@reduxjs/toolkit";


// Define the async thunk
const getStakersCount = createAsyncThunk<
  string,
  ActorSubclass<_SERVICESWAP>,
  { rejectValue: string }
>("icp_swap/getTotalStakerCount", async (actor, { rejectWithValue }) => {
  try {
    const result = await actor.get_stakers_count();
    
    return result.toString();
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching  all staked info"
  );
});

export default getStakersCount;


// -Limit on icp price, Lbry should be not be minted less than 500.
