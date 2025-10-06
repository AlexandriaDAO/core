import { _SERVICE } from "../../../../../../declarations/ALEX/ALEX.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { ActorSubclass } from "@dfinity/agent";

// Define the asyn thunk
const getAlexFee = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  ActorSubclass<_SERVICE>,
  { rejectValue: string }
>(
  "alex/getAlexFee",
  async (actor, { rejectWithValue }) => {
    try {
      const result = await actor.icrc1_fee();
      const LedgerServices = LedgerService();
      const fromatedFee = (
        Math.floor(LedgerServices.e8sToIcp(result) * 10 ** 4) /
        10 ** 4
      ).toFixed(4);

      return fromatedFee;
    } catch (error) {
      console.error("Failed to get ALEX fee:", error);

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
    }
    return rejectWithValue(
      "An unknown error occurred while fetching ALEX fee"
    );
  }
);

export default getAlexFee;
