import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import getLBRYratio from "./thunks/getLBRYratio";
import swapLbry from "./thunks/swapLbry";
import getMaxLbryBurn from "./thunks/getMaxLbryBurn";
import burnLbry from "./thunks/burnLBRY";
import getLbryBalance from "./thunks/lbryIcrc/getLbryBalance";
import stakeAlex from "./thunks/stakeAlex";
import getStakeInfo from "./thunks/getStakedInfo";
import claimReward from "./thunks/claimReward";
import unstake from "./thunks/unstake";
import transferLBRY from "./thunks/lbryIcrc/transferLBRY";
import getALlStakesInfo from "./thunks/getAllStakesInfo";
import getArchivedBal from "./thunks/getArchivedBal";
import redeemArchivedBalance from "./thunks/redeemArchivedBalance";
import getLBRYTransactions from "./thunks/lbryIcrc/getTransactions";

import { TransactionType } from "./thunks/lbryIcrc/getTransactions";
import getStakersCount from "./thunks/getStakersCount";
// Define the interface for our node state
export interface StakeInfo {
  stakedAlex: string;
  rewardIcp: string;
  unix_stake_time: string;
}

export interface SwapState {
  lbryRatio: string;
  lbryBalance: string;
  archivedBalance: string;
  maxLbryBurn: Number;
  stakeInfo: StakeInfo;
  totalStakers:string;
  totalStaked: string;
  loading: boolean;
  swapSuccess: boolean;
  burnSuccess: boolean;
  successStake: boolean;
  successClaimReward: boolean;
  unstakeSuccess: boolean;
  transferSuccess: boolean;
  redeeemSuccess: boolean;
  
  transactions: TransactionType[];
  error: string | null;
}

// Define the initial state using the ManagerState interface
const initialState: SwapState = {
  lbryRatio: "0",
  lbryBalance: "0",
  archivedBalance: "0",
  maxLbryBurn: 0,
  stakeInfo: { stakedAlex: "0", rewardIcp: "0", unix_stake_time: "0" },
  totalStakers:"0",
  totalStaked: "0",
  swapSuccess: false,
  redeeemSuccess: false,
  successStake: false,
  burnSuccess: false,
  successClaimReward: false,
  unstakeSuccess: false,
  transferSuccess: false,
  transactions: [],
  loading: false,
  error: null,
};

const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    flagHandler: (state) => {
      state.swapSuccess = false;
      state.burnSuccess = false;
      state.successStake = false;
      state.successClaimReward = false;
      state.unstakeSuccess = false;
      state.transferSuccess = false;
      state.redeeemSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<SwapState>) => {
    builder
      .addCase(getLBRYratio.pending, (state) => {
        // message.info("Fetching LBRY ratio");
        state.loading = true;
        state.error = null;
      })
      .addCase(getLBRYratio.fulfilled, (state, action) => {
        // message.success("LBRY ratio fetched.");
        state.lbryRatio = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getLBRYratio.rejected, (state, action) => {
        message.error("LBRY ratio could not be fetched!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getLbryBalance.pending, (state) => {
        // message.info("Fetching LBRY balance!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getLbryBalance.fulfilled, (state, action) => {
        // message.success("Fetched LBRY balance!");
        state.lbryBalance = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getLbryBalance.rejected, (state, action) => {
        message.error("LBRY balance could not be fetched!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getStakeInfo.pending, (state) => {
        message.info("Fetching staked info!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getStakeInfo.fulfilled, (state, action) => {
        message.success("Fetched staked info!");
        state.stakeInfo = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getStakeInfo.rejected, (state, action) => {
        message.error("Could not fetched staked info!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getALlStakesInfo.pending, (state) => {
        // message.info("Fetching staked info!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getALlStakesInfo.fulfilled, (state, action) => {
        message.success("Fetched all staked info!");
        state.totalStaked = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getALlStakesInfo.rejected, (state, action) => {
        message.error("Could not fetched all staked info!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(swapLbry.pending, (state) => {
        message.info("Swapping!");
        state.loading = true;
        state.error = null;
      })
      .addCase(swapLbry.fulfilled, (state, action) => {
        message.success("Successfully Swaped!");
        state.loading = false;
        state.swapSuccess = true;
        state.error = null;
      })
      .addCase(swapLbry.rejected, (state, action) => {
        message.error("Error while Swaping!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(stakeAlex.pending, (state) => {
        message.info("Staking!");
        state.loading = true;
        state.error = null;
      })
      .addCase(stakeAlex.fulfilled, (state, action) => {
        message.success("Successfully staked!");
        state.loading = false;
        state.successStake = true;
        state.error = null;
      })
      .addCase(stakeAlex.rejected, (state, action) => {
        message.error("Error while staking!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(burnLbry.pending, (state) => {
        message.info("Burning LBRY!");
        state.loading = true;
        state.error = null;
      })
      .addCase(burnLbry.fulfilled, (state, action) => {
        message.success("Burned LBRY sucessfully!");
        state.burnSuccess = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(burnLbry.rejected, (state, action) => {
        message.error("Error while burning!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(claimReward.pending, (state) => {
        message.info("Claiming!");
        state.loading = true;
        state.error = null;
      })
      .addCase(claimReward.fulfilled, (state, action) => {
        message.success("Successfully Claimed!");
        state.loading = false;
        state.successClaimReward = true;
        state.error = null;
      })
      .addCase(claimReward.rejected, (state, action) => {
        message.error("Error while claiming!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(unstake.pending, (state) => {
        message.info("Unstaking!");
        state.loading = true;
        state.error = null;
      })
      .addCase(unstake.fulfilled, (state, action) => {
        message.success("Successfully unstaked!");
        state.loading = false;
        state.unstakeSuccess = true;
        state.error = null;
      })
      .addCase(unstake.rejected, (state, action) => {
        message.error("Error while unstaking!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getMaxLbryBurn.pending, (state) => {
        // message.info("Fetching max allowed LBRY burn!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaxLbryBurn.fulfilled, (state, action) => {
        // message.success("Successfully fetched max allowed burn!");
        state.maxLbryBurn = action.payload;
        state.error = null;
      })
      .addCase(getMaxLbryBurn.rejected, (state, action) => {
        message.error("Error while fethcing max burn LBRY!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(transferLBRY.pending, (state) => {
        message.info("Processing LBRY transfer!");
        state.loading = true;
        state.error = null;
      })
      .addCase(transferLBRY.fulfilled, (state, action) => {
        message.success("Successfully transfered LBRY!");
        state.transferSuccess = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(transferLBRY.rejected, (state, action) => {
        message.error("Error while transfering LBRY");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getArchivedBal.pending, (state) => {
        message.info("Fetching archived balance!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getArchivedBal.fulfilled, (state, action) => {
        message.success("Successfully fetched archived balance!");
        state.archivedBalance = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getArchivedBal.rejected, (state, action) => {
        message.error("Error while fetching archived balance");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(redeemArchivedBalance.pending, (state) => {
        message.info("Claiming!");
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemArchivedBalance.fulfilled, (state, action) => {
        message.success("Successfully redeem!");
        state.loading = false;
        state.redeeemSuccess = true;
        state.error = null;
      })
      .addCase(redeemArchivedBalance.rejected, (state, action) => {
        message.error("Error while claiming!");
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getLBRYTransactions.pending, (state) => {
        message.info("fetching!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getLBRYTransactions.fulfilled, (state, action) => {
        message.success("Fetched Transactions!");
        state.loading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(getLBRYTransactions.rejected, (state, action) => {
        message.error("Error while fetching transactions!");
        state.loading = false;
        state.error = action.payload as string;
      }).addCase(getStakersCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStakersCount.fulfilled, (state, action) => {
        state.loading = false;
        state.totalStakers = action.payload;
        state.error = null;
      })
      .addCase(getStakersCount.rejected, (state, action) => {
        message.error("Error while fetching total stakers!");
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const { flagHandler } = swapSlice.actions;
export default swapSlice.reducer;
