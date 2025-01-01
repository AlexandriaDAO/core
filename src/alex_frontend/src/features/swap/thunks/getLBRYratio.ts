import { createAsyncThunk } from "@reduxjs/toolkit";
import { getActorSwap } from "@/features/auth/utils/authUtils";

// Define the async thunk
const getLBRYratio = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  void,
  { rejectValue: string }
>("icp_swap/getLBRYratio", async (_, { rejectWithValue }) => {
  try {
    const actor = await getActorSwap();
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
