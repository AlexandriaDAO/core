import { createAsyncThunk } from "@reduxjs/toolkit";
import { logs } from "../../../../../declarations/logs/";

interface LogData {
  alex_rate: bigint;
  alex_supply: bigint;
  apy: bigint;
  lbry_supply: bigint;
  nft_supply: bigint;
  staker_count: bigint;
  time: bigint;
  total_alex_staked: bigint;
  total_lbry_burn: bigint;
}

const formatDate = (timestamp: bigint): string => {
  const milliseconds = Number(timestamp) / 1_000_000; // Convert from nanoseconds to milliseconds
  const date = new Date(milliseconds);
  
  // Format the date to include hours, minutes, and seconds (in HH:MM:SS format)
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  // Return the date and time formatted as 'YYYY-MM-DD HH:MM:SS'
  return `${date.toISOString().slice(0, 10)} ${hours}:${minutes}:${seconds}`;
};

const getAllLogs = createAsyncThunk<
  {
    time: string;
    lbry: number;
    alex: number;
    nft: number;
    totalAlexStaked: number;
    stakerCount: number;
    alexRate: number;
    totalLbryBurn: number;
  }[],
  void,
  { rejectValue: string }
>("insights/getAllLogs", async (_, { rejectWithValue }) => {
  try {
    const result = await logs.get_all_logs();

    // Ensure that result is an array of tuples (nat64, Log)
    const response = result as Array<[bigint, LogData]>;

    // Check if response is actually an array of tuples
    if (!Array.isArray(response)) {
      throw new Error("The logs data is not in the expected format.");
    }

    // Create chartData array by mapping over the logs response
    const chartData = response.map(([timestamp, logData]) => ({
      time: formatDate(timestamp),
      lbry: Number(logData.lbry_supply) / 100_000_000,
      alex: Number(logData.alex_supply) / 100_000_000,
      nft: Number(logData.nft_supply),
      totalAlexStaked: Number(logData.total_alex_staked) / 100_000_000,
      stakerCount: Number(logData.staker_count),
      alexRate: Number(logData.alex_rate)/10_000,
      totalLbryBurn: Number(logData.total_lbry_burn),
    }));

    // Sort the data by timestamp (ascending order)
    chartData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return chartData;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An unknown error occurred while fetching insights logs");
  }
});

export default getAllLogs;