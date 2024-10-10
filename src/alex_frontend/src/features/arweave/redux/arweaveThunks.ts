import { createAsyncThunk } from '@reduxjs/toolkit';
import { setTransactions, setIsLoading, setMintableStates, clearTransactionsAndMintableState } from './arweaveSlice';
import { fetchTransactions } from '../api/arweaveApi';
import { RootState } from '@/store';
import { SearchState } from '../types/queries';

interface SearchParams {
  searchState: SearchState;
}

export const performSearch = createAsyncThunk(
  'arweave/performSearch',
  async (params: SearchParams, { dispatch, getState }) => {
    const { searchState } = params;
    const state = getState() as RootState;

    dispatch(setIsLoading(true));
    // Clear previous transactions and mintable state before starting a new search
    dispatch(clearTransactionsAndMintableState());

    try {
      let maxTimestamp: number | undefined;

      if (searchState.filterDate) {
        const userDateTime = new Date(`${searchState.filterDate}T${searchState.filterTime || "00:00"}:00Z`);
        maxTimestamp = Math.floor(userDateTime.getTime() / 1000);
      }

      const fetchedTransactions = await fetchTransactions({
        contentTypes: searchState.tags,
        amount: searchState.amount,
        maxTimestamp,
        ownerFilter: searchState.ownerFilter || undefined,
      });

      console.log("Fetched transactions:", fetchedTransactions);

      dispatch(setTransactions(fetchedTransactions));
      
      // Set initial mintable state for new transactions
      const newMintableStates = fetchedTransactions.reduce((acc, transaction) => {
        acc[transaction.id] = false;
        return acc;
      }, {} as Record<string, boolean>);
      dispatch(setMintableStates(newMintableStates));

      return {
        transactions: fetchedTransactions,
        contentTypes: searchState.tags,
        amount: searchState.amount,
        ownerFilter: searchState.ownerFilter,
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    } finally {
      dispatch(setIsLoading(false));
    }
  }
);

export const searchContent = createAsyncThunk(
  'arweave/searchContent',
  async (searchParams: SearchState, { rejectWithValue }) => {
    try {
      // Construct the query based on the searchParams
      let query = `{
        transactions(
          tags: [
            { name: "Content-Type", values: ${JSON.stringify(searchParams.tags)} }
          ]
          ${searchParams.filterDate ? `, block: { timestamp: { gt: "${searchParams.filterDate}T${searchParams.filterTime || '00:00'}:00Z" } }` : ''}
          ${searchParams.ownerFilter ? `, owners: ["${searchParams.ownerFilter}"]` : ''}
          first: ${searchParams.amount}
        ) {
          edges {
            node {
              id
              owner { address }
              data { size type }
              tags { name value }
            }
          }
        }
      }`;

      // ... (rest of the function remains the same)
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);