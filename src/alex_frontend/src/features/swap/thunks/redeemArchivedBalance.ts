import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getActorSwap } from "@/features/auth/utils/authUtils";

// Define the async thunk
const redeemArchivedBalance = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  void,
  { rejectValue: string }
>("icp_swap/redeemArchivedBalance", async (_, { rejectWithValue }) => {
  try {
    const actor = await getActorSwap();
    const result = await actor.redeem([]);
    if ("Ok" in result) return "success";
    if ("Err" in result) throw new Error(result.Err);
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while unstaking");
});

export default redeemArchivedBalance;
