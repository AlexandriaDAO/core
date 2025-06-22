import { createAsyncThunk } from "@reduxjs/toolkit";
import { tokenomics } from "../../../../../../declarations/tokenomics";

const rate = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("balance/alex/rate", async (_, { rejectWithValue }) => {
  try {
    const result = await tokenomics.get_current_ALEX_rate();
    // Convert the result to a proper number format
    const formattedRate = Number(result * BigInt(10000)) / 100000000;
    return formattedRate;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while fetching ALEX mint rate");
});

export default rate;