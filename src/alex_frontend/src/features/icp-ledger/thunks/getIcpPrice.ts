import { createAsyncThunk } from "@reduxjs/toolkit";
import { icp_swap } from "../../../../../declarations/icp_swap";

const getIcpPrice = createAsyncThunk<
  number, // This is the return type of the thunk's payload
  void,
  { rejectValue: string }
>("icp_swap/getIcpPrice", async (_, { rejectWithValue }) => {
  try {
    const ratio = await icp_swap.get_current_LBRY_ratio();
    // The ratio is returned as a BigInt, so we need to convert it to a number.
    // The ratio is scaled by 10^8, so we divide by 10^8 to get the actual ratio.
    return Number(ratio) / 1e8;
  } catch (error) {
    console.error("Failed to get ICP price:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An unknown error occurred while fetching ICP price");
  }
});

export default getIcpPrice;