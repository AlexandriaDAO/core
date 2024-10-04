import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { getActorSwap } from "@/features/auth/utils/authUtils";


// Define the async thunk
const getALlStakesInfo = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("icp_swap/getALlStakesInfo", async (_, { rejectWithValue }) => {
  try {
    const actor = await getActorSwap();
    const LedgerServices = LedgerService();

    const result = await actor.get_total_staked();
    
    return LedgerServices.e8sToIcp(result).toFixed(4);
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching  all staked info"
  );
});

export default getALlStakesInfo;
