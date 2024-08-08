import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
const getSubaccount = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {
    actor: ActorSubclass<_SERVICESWAP>;
  },
  { rejectValue: string }
>("icp_swap/getSubaccount", async ( {actor} , { rejectWithValue }) => {
  try {
    const result = await actor.caller_subaccount();
    return result;
  } catch (error) {
    console.error("Failed to get Subaccount :", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while fetching Subaccount");
});

export default getSubaccount;
