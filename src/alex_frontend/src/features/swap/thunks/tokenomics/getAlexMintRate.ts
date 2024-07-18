import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICETOKENOMICS } from "../../../../../../declarations/tokenomics/tokenomics.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
// Define the asyn thunk
const getAlexMintRate = createAsyncThunk<
  Number, // This is the return type of the thunk's payload
  {
    actor: ActorSubclass<_SERVICETOKENOMICS>;
  },
  { rejectValue: string }
>("tokenomics/getAlexMintRate", async ({ actor }, { rejectWithValue }) => {
  try {
    const result = await actor.get_current_ALEX_rate();
    return result;
  } catch (error) {
    console.error("Failed to get ALEX mint rate:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching ALEX mint rate"
  );
});


export default getAlexMintRate;
