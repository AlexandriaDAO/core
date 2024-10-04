import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import LedgerService from "@/utils/LedgerService";
import { StakeInfo } from "../swapSlice";
import { getActorSwap } from "@/features/auth/utils/authUtils";


// Define the async thunk
const getStakeInfo = createAsyncThunk<
  StakeInfo, // This is the return type of the thunk's payload
  string,
  { rejectValue: string }
>("icp_swap/getStakeInfo", async (account, { rejectWithValue }) => {
  try {
    const actor = await getActorSwap();
    const result = await actor.get_stake(Principal.fromText(account));
    if (result.length > 0) {
      // Stake exists
      const LedgerServices = LedgerService();
      const formattedStake = result?.[0]?.amount
        ? LedgerServices.e8sToIcp(result[0].amount).toString()
        : "0";
      const formattedReward = result?.[0]?.reward_icp
        ? LedgerServices.e8sToIcp(result[0].reward_icp).toString()
        : "0";
      const unix_stake_time = result?.[0]?.time ? result?.[0]?.time.toString() : "0";

      return {
        stakedAlex: formattedStake,
        rewardIcp: formattedReward,
        unix_stake_time,
      };
      // Use formattedBal as needed
    } else {
      // No stake found
      return {
        stakedAlex: "0",
        rewardIcp: "0",
        unix_stake_time:"0",
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching staked info"
  );
});

export default getStakeInfo;
