import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { getActorSwap } from "@/features/auth/utils/authUtils";

// Define the async thunk
const getMaxLbryBurn = createAsyncThunk<
  Number, // This is the return type of the thunk's payload
  void,
  { rejectValue: string }
>("icp_swap/getMaxLbryBurn", async (_, { rejectWithValue }) => {
  try {
    const actor = await getActorSwap();
    const result = await actor.get_maximum_LBRY_burn_allowed();

    if ("Ok" in result) {
        const LedgerServices = LedgerService();
        const resultNumber = LedgerServices.e8sToIcp(result.Ok);
        return resultNumber;
    }
    
    if ("Err" in result) {
        throw new Error(result.Err);
    }
  } catch (error) {
    console.error("Failed to get max LBRY:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching max LBRY"
  );
});
export default getMaxLbryBurn;
