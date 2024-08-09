import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";

// Define the async thunk
const getMaxLbryBurn = createAsyncThunk<
  Number, // This is the return type of the thunk's payload
  {
    actor: ActorSubclass<_SERVICESWAP>;
  },
  { rejectValue: string }
>("icp_swap/getMaxLbryBurn", async ({ actor }, { rejectWithValue }) => {
  try {
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
