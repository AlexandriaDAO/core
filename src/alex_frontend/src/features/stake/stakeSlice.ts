import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import stake from "./thunks/stake";
import getStake from "./thunks/getStake";
import claim from "./thunks/claim"; 
import unstake from "./thunks/unstake";
import getStaked from "./thunks/getStaked";
import getStakers from "./thunks/getStakers";
import getYield from "./thunks/getYield";
import { ErrorMessage } from "./utils/errors";

export interface Stake {
  // stake Alex
  staked: number;
  // icp reward earned
  reward: number;
  // when staked (unix timestamp)
  staked_at: number;
}

export interface StakeState {
  stake: Stake | null;
  stakeLoading: boolean;
  stakeError: string|null;

  stakers: number;
  stakersLoading: boolean;
  stakersError: string | null;

  staked: number;
  stakedLoading: boolean;
  stakedError: string | null;

  staking: boolean;
  stakingError: string | null;

  unstaking: boolean;
  unstakingError: string | null;

  claiming: boolean;
  claimingError: string | null;

  // Average Annual Percentage Yield
  yield: number;
  yieldLoading: boolean;
  yieldError: string | null;
}

const initialState: StakeState = {
  stake: null,
  stakeLoading: false,
  stakeError: null,

  stakers: -1,
  stakersLoading: false,
  stakersError: null,

  staked: -1,
  stakedLoading: false,
  stakedError: null,

  staking: false,
  stakingError: null,

  claiming: false,
  claimingError: null,

  unstaking: false,
  unstakingError: null,

  // Average Annual Percentage Yield
  yield: -1,
  yieldLoading: false,
  yieldError: null,
};

const stakeSlice = createSlice({
  name: "stake",
  initialState,
  reducers: {
    setStake: (state, action)=>{
      state.stake = action.payload;
    },
    resetError: (state) => {
      state.stakeError = null;
      state.stakersError = null;
      state.stakedError = null;
      state.stakingError = null;
      state.unstakingError = null;
      state.claimingError = null;
      state.yieldError = null;
    },
    resetLoading: (state) => {
      state.stakeLoading = false;
      state.stakersLoading = false;
      state.stakedLoading = false;
      state.staking = false;
      state.unstaking = false;
      state.claiming = false;
      state.yieldLoading = false;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<StakeState>) => {
    builder
      .addCase(getStake.pending, (state) => {
        state.stakeLoading = true;
        state.stakeError = null;
      })
      .addCase(getStake.fulfilled, (state, action) => {
        state.stake = action.payload;
        state.stakeLoading = false;
        state.stakeError = null;
      })
      .addCase(getStake.rejected, (state, action) => {
        state.stake = null;
        state.stakeLoading = false;
        state.stakeError = action.payload || "Could not fetch stake info";
      })

      .addCase(getStaked.pending, (state) => {
        state.stakedLoading = true;
        state.stakedError = null;
      })
      .addCase(getStaked.fulfilled, (state, action) => {
        state.staked = action.payload;
        state.stakedLoading = false;
        state.stakedError = null;
      })
      .addCase(getStaked.rejected, (state, action) => {
        state.stakedLoading = false;
        state.stakedError = action.payload || "Could not fetch total staked info";
      })

      .addCase(stake.pending, (state) => {
        state.staking = true;
        state.stakingError = null;
      })
      .addCase(stake.fulfilled, (state, action) => {
        state.staking = false;
        state.stakingError = null;
        toast.success("ALEX tokens staked successfully!");
      })
      .addCase(stake.rejected, (state, action) => {
        state.staking = false;
        state.stakingError = action.payload || "Error while staking";
      })

      .addCase(claim.pending, (state) => {
        state.claiming = true;
        state.claimingError = null;
      })
      .addCase(claim.fulfilled, (state, action) => {
        state.claiming = false;
        state.claimingError = null;
        toast.success("Rewards claimed successfully!");
      })
      .addCase(claim.rejected, (state, action) => {
        state.claiming = false;
        state.claimingError = action.payload || "Error while claiming";
      })

      .addCase(unstake.pending, (state) => {
        state.unstaking = true;
        state.unstakingError = null;
      })
      .addCase(unstake.fulfilled, (state, action) => {
        state.unstaking = false;
        state.unstakingError = null;
        toast.success("ALEX tokens unstaked successfully!");
      })
      .addCase(unstake.rejected, (state, action) => {
        state.unstaking = false;
        state.unstakingError = action.payload || "Error while unstaking";
      })

      .addCase(getStakers.pending, (state) => {
        state.stakersLoading = true;
        state.stakersError = null;
      })
      .addCase(getStakers.fulfilled, (state, action) => {
        state.stakers = action.payload;
        state.stakersLoading = false;
        state.stakersError = null;
      })
      .addCase(getStakers.rejected, (state, action) => {
        state.stakersLoading = false;
        state.stakersError = action.payload || "Error while fetching stakers count";
      })

      .addCase(getYield.pending, (state) => {
        state.yieldLoading = true;
        state.yieldError = null;
      })
      .addCase(getYield.fulfilled, (state, action) => {
        state.yield = action.payload;
        state.yieldLoading = false;
        state.yieldError = null;
      })
      .addCase(getYield.rejected, (state, action) => {
        state.yieldLoading = false;
        state.yieldError = action.payload || "Error while fetching yield data";
      });
  },
});

export const { setStake, resetError, resetLoading } = stakeSlice.actions;
export default stakeSlice.reducer;