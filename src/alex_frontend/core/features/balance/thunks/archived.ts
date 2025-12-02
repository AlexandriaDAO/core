import { createAsyncThunk } from "@reduxjs/toolkit";
import { icp_swap } from "../../../../../declarations/icp_swap";

const archived = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("balance/archived", async (_, { rejectWithValue }) => {
  try {
    const resultArchived = await icp_swap.get_total_archived_balance();
    const resultArchivedNumber = Number(resultArchived) / 100000000; // Convert e8s to ICP
    return resultArchivedNumber;
  } catch (error) {
    console.error("Failed to get canister archived balance:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching canister archived balance"
  );
});

export default archived;