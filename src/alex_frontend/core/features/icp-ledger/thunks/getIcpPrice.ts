import { createAsyncThunk } from "@reduxjs/toolkit";
import { icp_swap } from "../../../../../declarations/icp_swap";

const getIcpPrice = createAsyncThunk<
  number, // This is the return type of the thunk's payload
  void,
  { rejectValue: string }
>("icp_swap/getIcpPrice", async (_, { rejectWithValue }) => {
  try {
    const ratio = await icp_swap.get_current_LBRY_ratio();
    // The ratio is returned as LBRY tokens per ICP (e.g., 478 LBRY per ICP).
    // Convert to USD: LBRY count * $0.01 per LBRY token.
    return Number(ratio) * 0.01;
  } catch (error) {
    console.error("Failed to get ICP price:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An unknown error occurred while fetching ICP price");
  }
});

export default getIcpPrice;