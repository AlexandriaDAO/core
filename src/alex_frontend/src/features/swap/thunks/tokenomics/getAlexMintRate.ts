import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { getTokenomicsActor } from "@/features/auth/utils/authUtils";
// Define the asyn thunk
const getAlexMintRate = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  void,
  { rejectValue: string }
>("tokenomics/getAlexMintRate", async (_, { rejectWithValue }) => {
  try {
    const actor = await getTokenomicsActor();
    const result = await actor.get_current_ALEX_rate();
    const LedgerServices = LedgerService();
    const fromatedBal = LedgerServices.e8sToIcp(
      result * BigInt(10000)
    ).toString();
    return fromatedBal;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching ALEX mint rate"
  );
});

export default getAlexMintRate;
