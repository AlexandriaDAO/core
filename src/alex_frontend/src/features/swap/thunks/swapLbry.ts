import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
const swapLbry = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {
    actor: ActorSubclass<_SERVICESWAP>;
    amount: string;
  },
  { rejectValue: string }
>("icp_swap/swapLbry", async ({ actor, amount }, { rejectWithValue }) => {
  try {
    let amountFormat: bigint = BigInt(Number(amount) * 10 ** 8);
    const result = await actor.swap(amountFormat);
    if ("Ok" in result) return "success";
    if ("Err" in result) throw new Error(result.Err);
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while Swaping");
});

export default swapLbry;
