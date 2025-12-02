import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../../declarations/icp_swap/icp_swap.did";

const redeem = createAsyncThunk<
  void,
  ActorSubclass<_SERVICESWAP>,
  { rejectValue: string }
>("balance/icp/redeem", async (actor, { rejectWithValue }) => {
  try {
    const result = await actor.redeem([]);
    if ("Ok" in result) return;
    else if ("Err" in result) {
      return rejectWithValue(result.Err.toString());
    }
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while redeeming");
});

export default redeem;