import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { getActorSwap } from "@/features/auth/utils/authUtils";


// Define the async thunk
const getStakersCount = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("icp_swap/getTotalStakerCount", async (_, { rejectWithValue }) => {
  try {
    const actor = await getActorSwap();
   
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
