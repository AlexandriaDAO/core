import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getActorSwap } from "@/features/auth/utils/authUtils";
import { ErrorMessage, getErrorMessage } from "../utlis/erorrs";

// Define the async thunk
const unstake = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  void,
  { rejectValue: ErrorMessage }
>("icp_swap/unstake", async (_, { rejectWithValue }) => {
  try {
    const actor = await getActorSwap();
    const result = await actor.un_stake_all_ALEX([]);
    if ("Ok" in result) return "success";
    else if ("Err" in result) {
      const errorMessage = getErrorMessage(result.Err);
      return rejectWithValue(errorMessage);
    }
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return rejectWithValue({ title: error.message, message: "" });
    }
  }
  return rejectWithValue({
    title: "An unknown error occurred while unstaking",
    message: "",
  });
});

export default unstake;
