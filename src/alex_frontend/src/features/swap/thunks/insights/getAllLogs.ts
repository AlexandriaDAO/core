import { createAsyncThunk } from "@reduxjs/toolkit";
import { getLogs } from "@/features/auth/utils/authUtils";



 const getAllLogs = createAsyncThunk<
  { chartData: { time: string; lbry: number; alex: number; nft: number }[] },
  void,
  { rejectValue: string }
>("icp_swap/getAllLogs", async (_, { rejectWithValue }) => {
  try {
    const actor = await getLogs();
    const result = await actor.get_all_logs();

    // Process the result into chart data
    const chartData = result.map((log: any) => ({
      time: new Date(log.time / 1e6).toISOString().slice(0, 10), // YYYY-MM-DD
      lbry: log.lbry_supply,
      alex: log.alex_supply,
      nft: log.nft_supply,
    }));

    return { chartData };
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while fetching logs");
});

export default getAllLogs;