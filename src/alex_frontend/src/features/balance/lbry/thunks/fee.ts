import { createAsyncThunk } from "@reduxjs/toolkit";
import { LBRY } from "../../../../../../declarations/LBRY";

const fee = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("balance/lbry/fee", async (_, { rejectWithValue }) => {
  try {
    const result = await LBRY.icrc1_fee();
    // Convert e8s to LBRY and return as number
    const formattedFee = Number(result) / 100000000;
    return formattedFee;
  } catch (error) {
    console.error("Failed to get LBRY fee:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while fetching LBRY fee");
});

export default fee;