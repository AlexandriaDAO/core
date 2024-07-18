import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICETOKENOMICS } from "../../../../../../declarations/tokenomics/tokenomics.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
// Define the asyn thunk
const getUcgMintRate = createAsyncThunk<
  Number, // This is the return type of the thunk's payload
  {
    actor: ActorSubclass<_SERVICETOKENOMICS>;
  },
  { rejectValue: string }
>("tokenomics/getUcgMintRate", async ({ actor }, { rejectWithValue }) => {
  try {
    const result = await actor.get_current_UCG_rate();
    return result;
  } catch (error) {
    console.error("Failed to get UCG mint rate:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching UCG mint rate"
  );
});


export default getUcgMintRate;
