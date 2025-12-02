import { createAsyncThunk } from "@reduxjs/toolkit";
import { icp_swap } from "../../../../../../declarations/icp_swap";

const ratio = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("balance/lbry/ratio", async (_, { rejectWithValue }) => {
  try {
    const result = await icp_swap.get_current_LBRY_ratio();
    return Number(result);
  } catch (error) {
    console.error("Failed to get LBRY_ratio:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while fetching LBRY ratio");
});

export default ratio;