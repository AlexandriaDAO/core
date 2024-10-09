import { createAsyncThunk } from '@reduxjs/toolkit';
import { setTransactions, setIsLoading } from './arweaveSlice';
import { fetchRecentTransactions, fetchTransactionsByIds } from '../api/arweaveQueries';
import { Transaction } from '../types/queries';
import { fileTypeCategories } from '../types/files';
import { RootState } from '@/store';

interface SearchParams {
  mode: 'random' | 'general' | 'user';
  userTransactionIds?: string[];
}

export const performSearch = createAsyncThunk(
  'arweave/performSearch',
  async (params: SearchParams, { dispatch, getState }) => {
    const { mode, userTransactionIds } = params;
    const state = getState() as RootState;
    const {
      contentCategory,
      contentType,
      amount,
      filterDate,
      filterTime,
      ownerFilter,
    } = state.arweave.searchState;

    dispatch(setIsLoading(true));

    try {
      let maxTimestamp: number | undefined;

      if (filterDate) {
        const userDateTime = new Date(`${filterDate}T${filterTime || "00:00"}:00Z`);
        maxTimestamp = Math.floor(userDateTime.getTime() / 1000);
      }

      let contentTypes: string[] = [];

      if (contentType) {
        contentTypes = [contentType];
      } else if (contentCategory && contentCategory !== "all") {
        contentTypes = fileTypeCategories[contentCategory] || [];
      }

      let fetchedTransactions: Transaction[];

      if (mode === "random") {
        fetchedTransactions = await fetchTransactionsByIds(
          userTransactionIds || [],
          contentTypes,
          maxTimestamp
        );
      } else {
        fetchedTransactions = await fetchRecentTransactions(
          contentTypes,
          amount,
          maxTimestamp,
          ownerFilter || undefined
        );
      }

      console.log("Fetched transactions:", fetchedTransactions);

      dispatch(setTransactions(fetchedTransactions));

      return {
        transactions: fetchedTransactions,
        contentTypes,
        amount,
        ownerFilter,
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    } finally {
      dispatch(setIsLoading(false));
    }
  }
);