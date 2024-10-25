import { createAsyncThunk } from '@reduxjs/toolkit';
import { setTransactions, addTransactions, clearTransactions } from './contentDisplaySlice';
import { fetchTransactionsApi } from '../../arweaveSearch/api/arweaveApi';
import { setMintableStates, MintableStateItem } from '../../arweaveSearch/redux/arweaveSlice';

export const updateTransactions = createAsyncThunk(
  'contentDisplay/updateTransactions',
  async (arweaveIds: string[], { dispatch }) => {
    try {
      const fetchedTransactions = await fetchTransactionsApi({
        nftIds: arweaveIds,
      });

      dispatch(setTransactions(fetchedTransactions));

      // Set initial mintable state for new transactions
      const newMintableStates = fetchedTransactions.reduce((acc, transaction) => {
        acc[transaction.id] = { mintable: false };
        return acc;
      }, {} as Record<string, MintableStateItem>);
      dispatch(setMintableStates(newMintableStates));

    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
);

export const appendTransactions = createAsyncThunk(
  'contentDisplay/appendTransactions',
  async (arweaveIds: string[], { dispatch, getState }) => {
    try {
      const fetchedTransactions = await fetchTransactionsApi({
        nftIds: arweaveIds,
      });

      dispatch(addTransactions(fetchedTransactions));

      // Set initial mintable state for new transactions
      const state = getState() as { arweave: { mintableStates: Record<string, MintableStateItem> } };
      const currentMintableStates = state.arweave.mintableStates;
      const newMintableStates = fetchedTransactions.reduce((acc, transaction) => {
        if (!currentMintableStates[transaction.id]) {
          acc[transaction.id] = { mintable: false };
        }
        return acc;
      }, {} as Record<string, MintableStateItem>);
      dispatch(setMintableStates({ ...currentMintableStates, ...newMintableStates }));

    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
);

export const clearAllTransactions = createAsyncThunk(
  'contentDisplay/clearAllTransactions',
  async (_, { dispatch }) => {
    dispatch(clearTransactions());
    dispatch(setMintableStates({}));
  }
);
