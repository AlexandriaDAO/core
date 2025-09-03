import { createSlice } from '@reduxjs/toolkit';
import getAllLogs from './thunks/getAllLogs';

export interface ChartDataPoint {
  time: string;
  lbry: number;
  alex: number;
  nft: number;
  totalAlexStaked: number;
  stakerCount: number;
  alexRate: number;
  totalLbryBurn: number;
  rewardRate: number; // ICP rewards per ALEX per hour (scaled)
}

export interface InsightsState {
  data: ChartDataPoint[];
  loading: boolean;
  error: string | null;
}

const initialState: InsightsState = {
  data: [],
  loading: false,
  error: null
};

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getAllLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch insights data';
      });
  }
});

export default insightsSlice.reducer;