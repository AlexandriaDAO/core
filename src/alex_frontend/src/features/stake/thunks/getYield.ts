import { icp_swap } from "../../../../../declarations/icp_swap";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getYield = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("stake/getYield", async (_, { rejectWithValue }) => {
  try {
    // Fetch APY values from the contract
    const apyResult = await icp_swap.get_all_apy_values();
    console.log(apyResult, 'result')
    // Validate APY result
    if (!Array.isArray(apyResult) || apyResult.length === 0) {
      throw new Error("No APY data available");
    }
    
    // Fetch scaling factor
    const scalingFactorResult = await icp_swap.get_scaling_factor();
    
    // Convert e8s to decimal (divide by 10^8)
    const scalingFactor = Number(scalingFactorResult) / 1e8;
    
    // Validate scaling factor
    if (scalingFactor <= 0) {
      throw new Error("Invalid scaling factor received");
    }
    
    // Calculate sum of all APY values
    const sum = apyResult.reduce(
      (acc, record) => acc + BigInt(record[1]),
      BigInt(0)
    );
    
    // Convert sum to decimal and calculate average
    const average = Number(sum) / 1e8 / apyResult.length;
    
    // Calculate final yield
    const finalYield = average / scalingFactor;
    
    // Validate result
    if (isNaN(finalYield) || finalYield < 0) {
      throw new Error("Invalid yield calculation result");
    }
    
    return finalYield;
    
  } catch (error) {
    console.error("Error fetching yield/APY:", error);
    
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    
    return rejectWithValue("An unknown error occurred while fetching yield data");
  }
});

export default getYield;