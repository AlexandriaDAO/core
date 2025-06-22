import { icp_swap } from "../../../../../declarations/icp_swap";
import { ActorSubclass } from "@dfinity/agent";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getStakers = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("stake/getStakers", async (_, { rejectWithValue }) => {
  try {
    // Fetch stakers count from the contract
    const result = await icp_swap.get_stakers_count();
    
    // Convert result to number
    const stakersCount = Number(result);
    
    // Validate the result
    if (isNaN(stakersCount) || stakersCount < 0) {
      throw new Error("Invalid stakers count received from contract");
    }
    
    return stakersCount;
    
  } catch (error) {
    console.error("Error fetching stakers count:", error);
    
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    
    return rejectWithValue("An unknown error occurred while fetching stakers count");
  }
});

export default getStakers;