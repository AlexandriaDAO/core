import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";

import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";


// Define the async thunk
const getALlStakesInfo = createAsyncThunk<
  string,
  {
    actor: ActorSubclass<_SERVICESWAP>;
  },
  { rejectValue: string }
>("icp_swap/getALlStakesInfo", async ({ actor }, { rejectWithValue }) => {
  try {
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
