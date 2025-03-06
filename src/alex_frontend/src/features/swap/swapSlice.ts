import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import getLBRYratio from "./thunks/getLBRYratio";
import swapLbry from "./thunks/swapLbry";
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
import fetchTransaction from "./thunks/lbryIcrc/getTransactions";
import getSpendingBalance from "./thunks/lbryIcrc/getSpendingBalance";
import getAlexSpendingBalance from "./thunks/alexIcrc/getAlexSpendingBalance";

import { TransactionType } from "./thunks/lbryIcrc/getTransactions";
import getStakersCount from "./thunks/getStakersCount";
import getCanisterArchivedBal from "./thunks/getCanisterArchivedBal";
import getAverageApy from "./thunks/getAverageApy";
import getLbryFee from "./thunks/lbryIcrc/getLbryFee";
import getAllLogs from "./thunks/insights/getAllLogs";
import { ErrorMessage } from "./utlis/erorrs";
// Define the interface for our node state
export interface StakeInfo {
  stakedAlex: string;
  rewardIcp: string;
  unix_stake_time: string;
}
export interface CanisterArchived {
  canisterArchivedBal: Number;
  canisterUnClaimedIcp: Number;
}

export interface SwapState {
  lbryRatio: string;
  lbryBalance: string;
  lbryFee: string;
  archivedBalance: string;
  maxLbryBurn: Number;
  stakeInfo: StakeInfo;
  totalStakers: string;
  totalStaked: string;
  canisterArchivedBal: CanisterArchived;
  loading: boolean;
  swapSuccess: boolean;
  burnSuccess: boolean;
  successStake: boolean;
  successClaimReward: boolean;
  unstakeSuccess: boolean;
  transferSuccess: boolean;
  redeeemSuccess: boolean;
  transactions: TransactionType[];
  averageAPY: number;
  error: ErrorMessage | null;
  spendingBalance: string;
  alexSpendingBalance: string;
  logsData: {
    chartData: {
      time: string;
      lbry: number;
      alex: number;
      nft: number;
      totalAlexStaked: number;
      stakerCount: number;
      alexRate: number;
      totalLbryBurn: number;
    }[];
  };
}

// Define the initial state using the ManagerState interface
const initialState: SwapState = {
  lbryRatio: "0",
  lbryFee: "0",
  lbryBalance: "0",
  archivedBalance: "0",
  maxLbryBurn: 0,
  stakeInfo: { stakedAlex: "0", rewardIcp: "0", unix_stake_time: "0" },
  totalStakers: "0",
  canisterArchivedBal: { canisterUnClaimedIcp: 0, canisterArchivedBal: 0 },
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
  averageAPY: 0,
  error: null,
  spendingBalance: "0",
  alexSpendingBalance: "0",
  logsData: {
    chartData: [],
  },
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
        // toast.info("Fetching LBRY ratio");
        state.loading = true;
        state.error = null;
      })
      .addCase(getLBRYratio.fulfilled, (state, action) => {
        // toast.success("LBRY ratio fetched.");
        state.lbryRatio = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getLBRYratio.rejected, (state, action) => {
        toast.error("LBRY ratio could not be fetched!");
        state.loading = false;
        state.error = null; // action.payload as string;
      })
      .addCase(getLbryBalance.pending, (state) => {
        // toast.info("Fetching LBRY balance!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getLbryBalance.fulfilled, (state, action) => {
        // toast.success("Fetched LBRY balance!");
        state.lbryBalance = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getLbryBalance.rejected, (state, action) => {
        toast.error("LBRY balance could not be fetched!");
        state.loading = false;
        state.error = state.error = {
          message: "",
          title: (action.payload as string) || "",
        };
      })
      .addCase(getStakeInfo.pending, (state) => {
        // toast.info("Fetching staked info!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getStakeInfo.fulfilled, (state, action) => {
        state.stakeInfo = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getStakeInfo.rejected, (state, action) => {
        toast.error("Could not fetched staked info!");
        state.loading = false;
        state.error = state.error = {
          message: "",
          title: (action.payload as string) || "",
        };
      })
      .addCase(getALlStakesInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getALlStakesInfo.fulfilled, (state, action) => {
        // toast.success("Fetched all staked info!");
        state.totalStaked = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getALlStakesInfo.rejected, (state, action) => {
        toast.error("Could not fetched all staked info!");
        state.loading = false;
        state.error = state.error = {
          message: "",
          title: (action.payload as string) || "",
        };
      })
      .addCase(swapLbry.pending, (state) => {
        // toast.info("Swapping!");
        state.loading = true;
        state.error = null;
      })
      .addCase(swapLbry.fulfilled, (state, action) => {
        toast.success("Successfully Swaped!");
        state.loading = false;
        state.swapSuccess = true;
        state.error = null;
      })
      .addCase(swapLbry.rejected, (state, action) => {
        toast.error(action.payload?.message);
        state.loading = false;
        state.error = {
          message: action?.payload?.message || "",
          title: action.payload?.title || "",
        };
      })
      .addCase(stakeAlex.pending, (state) => {
        toast.info("Staking!");
        state.loading = true;
        state.error = null;
      })
      .addCase(stakeAlex.fulfilled, (state, action) => {
        toast.success("Successfully staked!");
        state.loading = false;
        state.successStake = true;
      })
      .addCase(stakeAlex.rejected, (state, action) => {
        toast.error("Error while staking!");
        state.loading = false;
        state.error = {
          message: action?.payload?.message || "",
          title: action.payload?.title || "",
        };
      })
      .addCase(burnLbry.pending, (state) => {
        toast.info("Burning LBRY!");
        state.loading = true;
        state.error = null;
      })
      .addCase(burnLbry.fulfilled, (state, action) => {
        toast.success("Burned LBRY sucessfully!");
        state.burnSuccess = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(burnLbry.rejected, (state, action) => {
        toast.error(action.payload?.message);
        state.loading = false;
        state.error = {
          message: action?.payload?.message || "",
          title: action.payload?.title || "",
        };
      })
      .addCase(claimReward.pending, (state) => {
        // toast.info("Claiming!");
        state.loading = true;
        state.error = null;
      })
      .addCase(claimReward.fulfilled, (state, action) => {
        toast.success("Successfully Claimed!");
        state.loading = false;
        state.successClaimReward = true;
        state.error = null;
      })
      .addCase(claimReward.rejected, (state, action) => {
        toast.error("Error while claiming!");
        state.loading = false;
        state.error = {
          message: action?.payload?.message || "",
          title: action.payload?.title || "",
        };
      })
      .addCase(unstake.pending, (state) => {
        // toast.info("Unstaking!");
        state.loading = true;
        state.error = null;
      })
      .addCase(unstake.fulfilled, (state, action) => {
        toast.success("Successfully unstaked!");
        state.loading = false;
        state.unstakeSuccess = true;
        state.error = null;
      })
      .addCase(unstake.rejected, (state, action) => {
        toast.error("Error while unstaking!");
        state.loading = false;
        state.error = {
          message: action?.payload?.message || "",
          title: action.payload?.title || "",
        };
      })

      .addCase(transferLBRY.pending, (state) => {
        toast.info("Processing LBRY transfer!");
        state.loading = true;
        state.error = null;
      })
      .addCase(transferLBRY.fulfilled, (state, action) => {
        toast.success("Successfully transfered LBRY!");
        state.transferSuccess = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(transferLBRY.rejected, (state, action) => {
        toast.error("Error while transfering LBRY");
        state.loading = false;
        state.error = {
          message: action?.payload || "",
          title: "",
        };
      })
      .addCase(getArchivedBal.pending, (state) => {
        // toast.info("Fetching archived balance!");
        state.loading = true;
        state.error = null;
      })
      .addCase(getArchivedBal.fulfilled, (state, action) => {
        // toast.success("Successfully fetched archived balance!");
        state.archivedBalance = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getArchivedBal.rejected, (state, action) => {
        toast.error("Error while fetching archived balance");
        state.loading = false;
        state.error = {
          message: action?.payload || "",
          title: action.payload || "",
        };
      })
      .addCase(redeemArchivedBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemArchivedBalance.fulfilled, (state, action) => {
        toast.success("Successfully redeem!");
        state.loading = false;
        state.redeeemSuccess = true;
        state.error = null;
      })
      .addCase(redeemArchivedBalance.rejected, (state, action) => {
        toast.error("Error while claiming!");
        state.loading = false;
        state.error = {
          message: action?.payload?.message || "",
          title: action.payload?.title || "",
        };
      })
      .addCase(fetchTransaction.pending, (state) => {
        // toast.info("Fetching!");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        // toast.success("Fetched Transactions!");
        state.loading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        toast.error("Error while fetching transactions!");
        state.loading = false;
        state.error = {
          message: "",
          title: action.payload || "",
        };
      })
      .addCase(getStakersCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStakersCount.fulfilled, (state, action) => {
        state.loading = false;
        state.totalStakers = action.payload;
        state.error = null;
      })
      .addCase(getStakersCount.rejected, (state, action) => {
        toast.error("Error while fetching total stakers!");
        state.loading = false;
        state.error = state.error = {
          message: "",
          title: action.payload || "",
        };
      })
      .addCase(getCanisterArchivedBal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCanisterArchivedBal.fulfilled, (state, action) => {
        state.loading = false;
        state.canisterArchivedBal = action.payload;
        state.error = null;
      })
      .addCase(getCanisterArchivedBal.rejected, (state, action) => {
        toast.error("Error while fetching canister archived balance!");
        state.loading = false;
        state.error = {
          message: "",
          title: action.payload || "",
        };
      })
      .addCase(getAverageApy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAverageApy.fulfilled, (state, action) => {
        state.loading = false;
        state.averageAPY = action.payload;
        state.error = null;
      })
      .addCase(getAverageApy.rejected, (state, action) => {
        toast.error("Error while fetching canister average APY!");
        state.loading = false;
        state.error = {
          message: "",
          title: action.payload || "",
        };
      })
      .addCase(getLbryFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLbryFee.fulfilled, (state, action) => {
        state.lbryFee = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getLbryFee.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: "",
          title: action.payload || "",
        };
      })
      .addCase(getSpendingBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpendingBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.spendingBalance = action.payload;
        state.error = null;
      })
      .addCase(getSpendingBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: "",
          title: action.payload || "",
        };
      })
      .addCase(getAlexSpendingBalance.fulfilled, (state, action) => {
        state.alexSpendingBalance = action.payload;
        state.loading = false;
      })
      .addCase(getAlexSpendingBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAlexSpendingBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = state.error = {
          message: "",
          title: action.payload || "Failed to get ALEX spending balance ",
        };
      })
      .addCase(getAllLogs.fulfilled, (state, action) => {
        state.logsData = action.payload;
        state.loading = false;
      })
      .addCase(getAllLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = state.error = {
          message: "",
          title: action.payload || "Failed to get log data",
        };
      });
  },
});
export const { flagHandler } = swapSlice.actions;
export default swapSlice.reducer;
