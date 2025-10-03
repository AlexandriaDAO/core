import { createAsyncThunk } from "@reduxjs/toolkit";
import { logs } from "../../../../../declarations/logs/";
import { icp_swap } from "../../../../../declarations/icp_swap";
import { icp_swap_factory } from "../../../../../declarations/icp_swap_factory";

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
    rewardRate: number;
  }[],
  void,
  { rejectValue: string }
>("insights/getAllLogs", async (_, { rejectWithValue }) => {
  try {
    // Fetch current prices in parallel with logs
    const [logsResult, icpRatio, alexPoolData, scalingFactor] = await Promise.all([
      logs.get_all_logs(),
      icp_swap.get_current_LBRY_ratio().catch(() => BigInt(0)),
      icp_swap_factory.getPoolsForToken('ysy5f-2qaaa-aaaap-qkmmq-cai').catch(() => []),
      icp_swap.get_scaling_factor().catch(() => BigInt(1000000000000))
    ]);

    // Calculate ICP price in USD (LBRY ratio * $0.01 per LBRY)
    const icpPrice = Number(icpRatio) * 0.01;
    
    // Get ALEX price in USD from pool data
    let alexPrice = 1.0; // Default fallback
    if (alexPoolData && alexPoolData.length > 0 && alexPoolData[0]?.token0Price) {
      alexPrice = parseFloat(alexPoolData[0].token0Price.toString());
    }

    // Convert scaling factor
    const scalingFactorNum = Number(scalingFactor) / 1e8;

    // Ensure that result is an array of tuples (nat64, Log)
    const response = logsResult as Array<[bigint, LogData]>;

    // Check if response is actually an array of tuples
    if (!Array.isArray(response)) {
      throw new Error("The logs data is not in the expected format.");
    }

    // Create chartData array by mapping over the logs response
    const chartData = response.map(([timestamp, logData]) => {
      // Calculate actual APY percentage using current prices
      // Raw value is ICP rewards per ALEX (scaled)
      const rewardPerAlexScaled = Number(logData.apy) / 1e8; // Convert to e8s
      const rewardPerAlex = rewardPerAlexScaled / scalingFactorNum; // Remove scaling factor
      
      // Calculate hourly APY percentage: (reward_icp * icp_price / alex_price) * 100
      const hourlyAPY = alexPrice > 0 && icpPrice > 0 
        ? (rewardPerAlex * icpPrice / alexPrice) * 100
        : 0;
      
      // Annualize it
      const annualAPY = hourlyAPY * 24 * 365;

      return {
        time: formatDate(timestamp),
        lbry: Number(logData.lbry_supply) / 100_000_000,
        alex: Number(logData.alex_supply) / 100_000_000,
        nft: Number(logData.nft_supply),
        totalAlexStaked: Number(logData.total_alex_staked) / 100_000_000,
        stakerCount: Number(logData.staker_count),
        alexRate: Number(logData.alex_rate)/10_000,
        totalLbryBurn: Number(logData.total_lbry_burn),
        // Actual APY percentage based on current market prices (e.g., 1.5 for 1.5%)
        rewardRate: annualAPY,
      };
    });

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