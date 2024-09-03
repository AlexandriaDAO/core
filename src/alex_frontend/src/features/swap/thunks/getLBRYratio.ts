import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
const getLBRYratio = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {
    actor: ActorSubclass<_SERVICESWAP>;
  },
  { rejectValue: string }
>("icp_swap/getLBRYratio", async ({ actor }, { rejectWithValue }) => {
  try {
    const result = await actor.get_current_LBRY_ratio();
    return result.toString();
  } catch (error) {
    console.error("Failed to get LBRY_ratio:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while fetching LBRY ratio");
});

export default getLBRYratio;
