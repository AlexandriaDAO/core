/**
 * Unified transaction thunks that replace both contentDisplayThunks and nftTransactionsThunks
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getTransactionService } from '../../../shared/services/transactionService';
import { AppDispatch, RootState } from '@/store';
import { Transaction } from '../../../shared/types/queries';
import { fetchTransactionsForAlexandrian } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi';
import { setTransactions } from './transactionSlice';

/**
 * Fetch transactions for NFTs
 */
export const fetchNftTransactions = createAsyncThunk<
  Transaction[],
  string[],
  { dispatch: AppDispatch; state: RootState }
>(
  'transactions/fetchNftTransactions',
  async (arweaveIds: string[], { dispatch, getState }) => {
    const transactionService = getTransactionService(dispatch, getState);
    return await transactionService.fetchNftTransactions(arweaveIds);
  }
);

/**
 * Fetch transactions for Permasearch
 */
export const fetchPermasearchTransactions = createAsyncThunk<
  Transaction[],
  { query: string; owner?: string; cursor?: string; limit?: number },
  { dispatch: AppDispatch; state: RootState }
>(
  'transactions/fetchPermasearchTransactions',
  async (params, { dispatch, getState }) => {
    const transactionService = getTransactionService(dispatch, getState);
    return await transactionService.fetchPermasearchTransactions(
      params.query,
      params.owner,
      params.cursor,
      params.limit
    );
  }
);

/**
 * Load content for transactions
 */
export const loadContentForTransactions = createAsyncThunk<
  void,
  Transaction[],
  { dispatch: AppDispatch; state: RootState }
>(
  'transactions/loadContentForTransactions',
  async (transactions, { dispatch, getState }) => {
    const transactionService = getTransactionService(dispatch, getState);
    await transactionService.loadContentForTransactions(transactions);
  }
);

/**
 * Clear all transactions
 */
export const clearAllTransactions = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>(
  'transactions/clearAllTransactions',
  async (_, { dispatch, getState }) => {
    const transactionService = getTransactionService(dispatch, getState);
    transactionService.clearAll();
  }
);

/**
 * Add a transaction
 */
export const addTransaction = createAsyncThunk<
  void,
  Transaction,
  { dispatch: AppDispatch; state: RootState }
>(
  'transactions/addTransaction',
  async (transaction, { dispatch, getState }) => {
    const transactionService = getTransactionService(dispatch, getState);
    transactionService.addTransaction(transaction);
  }
);

/**
 * Remove a transaction
 */
export const removeTransaction = createAsyncThunk<
  void,
  string,
  { dispatch: AppDispatch; state: RootState }
>(
  'transactions/removeTransaction',
  async (id, { dispatch, getState }) => {
    const transactionService = getTransactionService(dispatch, getState);
    transactionService.removeTransaction(id);
  }
);

/**
 * Update transactions based on arweave IDs
 */
export const updateTransactions = createAsyncThunk<
  Transaction[],
  string[],
  { dispatch: AppDispatch; state: RootState }
>(
  'transactions/updateTransactions',
  async (arweaveIds: string[], { dispatch, getState }) => {
    // Get existing transactions from state first
    const state = getState();
    const existingTransactions = state.transactions.transactions;
    
    if (arweaveIds.length === 0) {
      // If no arweave IDs provided, return existing transactions without changing state
      return existingTransactions;
    }

    // Fetch transactions for the arweave IDs
    const newTransactions = await fetchTransactionsForAlexandrian(arweaveIds);
    
    // Create a map of existing transactions by ID for quick lookup
    const existingTransactionMap = new Map(
      existingTransactions.map(tx => [tx.id, tx])
    );
    
    // Create a merged list with new transactions, preserving existing ones
    // If a transaction already exists, keep the existing data
    const mergedTransactions = [
      ...existingTransactions,
      ...newTransactions.filter(newTx => !existingTransactionMap.has(newTx.id))
    ];
    
    // Update the store with the merged transactions
    dispatch(setTransactions(mergedTransactions));
    
    // Only load content for the new transactions to avoid redundant loading
    const transactionsToLoad = newTransactions.filter(
      newTx => !existingTransactionMap.has(newTx.id) || 
              (existingTransactionMap.has(newTx.id) && 
               !('content' in existingTransactionMap.get(newTx.id)!))
    );
    
    if (transactionsToLoad.length > 0) {
      await dispatch(loadContentForTransactions(transactionsToLoad));
    }
    
    return mergedTransactions;
  }
); 