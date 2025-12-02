import { ALEX } from "../../../../../declarations/ALEX";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";

const getStaked = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("stake/getStaked", async (_, { rejectWithValue }) => {
  try {
    const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;

    const result = await ALEX.icrc1_balance_of({
      owner: Principal.fromText(icp_swap_canister_id),
      subaccount: [],
    });

    // Convert e8s to decimal (divide by 10^8)
    const totalStaked = Number(result) / 1e8;
    
    return totalStaked;
  } catch (error) {
    console.error("Error fetching total staked info:", error);
    
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    
    return rejectWithValue("Failed to fetch total staked information");
  }
});

export default getStaked;