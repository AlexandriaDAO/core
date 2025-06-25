import { createAsyncThunk } from "@reduxjs/toolkit";
import { icp_swap } from "../../../../../declarations/icp_swap";

const unclaimed = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("balance/unclaimed", async (_, { rejectWithValue }) => {
  try {
    const resultUnclaimed = await icp_swap.get_total_unclaimed_icp_reward();
    const resultUnclaimedNumber = Number(resultUnclaimed) / 100000000; // Convert e8s to ICP
    return resultUnclaimedNumber;
  } catch (error) {
    console.error("Failed to get canister unclaimed balance:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching canister unclaimed balance"
  );
});

export default unclaimed;