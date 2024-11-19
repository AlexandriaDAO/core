import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import {getLbryActor } from "@/features/auth/utils/authUtils";

// Define the asyn thunk
const getLbryFee = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  void,
  { rejectValue: string }
>(
  "icp_swap/getLbryFee",
  async (_, { rejectWithValue }) => {
    try {
      const actor = await getLbryActor();
      const result = await actor.icrc1_fee();
      const LedgerServices = LedgerService();
      const fromatedFee = (
        Math.floor(LedgerServices.e8sToIcp(result) * 10 ** 4) /
        10 ** 4
      ).toFixed(4);

      return fromatedFee;
    } catch (error) {
      console.error("Failed to get LBRY fee:", error);

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
    }
    return rejectWithValue(
      "An unknown error occurred while fetching LBRY fee"
    );
  }
);

export default getLbryFee;
