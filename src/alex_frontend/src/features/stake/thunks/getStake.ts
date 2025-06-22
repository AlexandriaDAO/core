import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { Stake } from "../stakeSlice";
import { icp_swap } from "../../../../../declarations/icp_swap";
import { RootState } from "@/store";

const getStake = createAsyncThunk<
  Stake,
  void,
  { rejectValue: string, state: RootState }
>("stake/getStake", async (_, { rejectWithValue, getState }) => {
  try {
    const {user} = getState().auth;
    if(!user?.principal) throw new Error('Unauthenticated users not allowed.')

    const result = await icp_swap.get_stake(Principal.fromText(user.principal));

    if (Array.isArray(result) && result.length > 0 && result[0]) {

      // Stake exists
      const stakeData = result[0];

      // Convert e8s to decimal (divide by 10^8)
      const stakedAmount = stakeData.amount ? Number(stakeData.amount) / 1e8 : 0;
      const rewardAmount = stakeData.reward_icp ? Number(stakeData.reward_icp) / 1e8 : 0;
      const stakeTime = stakeData.time ? Number(stakeData.time) : 0;

      return {
        staked: stakedAmount,
        reward: rewardAmount,
        staked_at: stakeTime,
      };
    }

    throw new Error("No stake found");
  } catch (error) {
    console.error("Error fetching stake info:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Failed to fetch stake information");
  }
});

export default getStake;