import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { getActorSwap } from "@/features/auth/utils/authUtils";
import { CanisterArchived } from "../swapSlice";

// Define the async thunk
const getAverageApy = createAsyncThunk<
  number, // This is the return type of the thunk's payload
  void,
  { rejectValue: string }
>("icp_swap/getAverageApy", async (_, { rejectWithValue }) => {
  try {
    const LedgerServices = LedgerService();
    const actor = await getActorSwap();
    const result = await actor.get_all_apy_values();
    const scalingFactor = LedgerServices.e8sToIcp(
      await actor.get_scaling_factor()
    );
    const sum = result.reduce(
      (acc, record) => acc + BigInt(record[1]),
      BigInt(0)
    );
    const average = LedgerServices.e8sToIcp(sum) / result.length;

    return average / scalingFactor;
  } catch (error) {
    console.error("Failed to get canister archived balances:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching canister archived balances"
  );
});
export default getAverageApy;
