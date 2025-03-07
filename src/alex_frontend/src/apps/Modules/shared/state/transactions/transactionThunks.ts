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
    const nfts = state.nftData.nfts;
    
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
    
    // Create a map to track the original order of arweave IDs
    const arweaveIdOrderMap = new Map(
      arweaveIds.map((id, index) => [id, index])
    );
    
    // Find NFT data for each arweave ID to get the orderIndex
    const nftOrderMap = new Map();
    Object.values(nfts).forEach(nft => {
      if (nft.orderIndex !== undefined && arweaveIds.includes(nft.arweaveId)) {
        nftOrderMap.set(nft.arweaveId, nft.orderIndex);
      }
    });
    
    // Create a merged list with new transactions, preserving existing ones
    // If a transaction already exists, keep the existing data
    const mergedTransactions = [
      ...existingTransactions.filter(tx => !arweaveIds.includes(tx.id)),
      ...newTransactions.map(newTx => {
        // If the transaction already exists, preserve its data
        if (existingTransactionMap.has(newTx.id)) {
          return existingTransactionMap.get(newTx.id)!;
        }
        return newTx;
      })
    ];
    
    // Sort the merged transactions based on the original order of arweave IDs
    // Only sort the transactions that are part of the current request
    const requestedTransactions = mergedTransactions.filter(tx => arweaveIds.includes(tx.id));
    const otherTransactions = mergedTransactions.filter(tx => !arweaveIds.includes(tx.id));
    
    // Sort requested transactions based on NFT orderIndex first, then arweaveIdOrderMap
    requestedTransactions.sort((a, b) => {
      // First try to use NFT orderIndex if available
      const aOrderFromNft = nftOrderMap.has(a.id) ? nftOrderMap.get(a.id) : undefined;
      const bOrderFromNft = nftOrderMap.has(b.id) ? nftOrderMap.get(b.id) : undefined;
      
      if (aOrderFromNft !== undefined && bOrderFromNft !== undefined) {
        return aOrderFromNft - bOrderFromNft;
      }
      
      // Fall back to arweaveIdOrderMap
      const aOrder = arweaveIdOrderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = arweaveIdOrderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
    
    // Combine sorted requested transactions with other transactions
    const sortedMergedTransactions = [...requestedTransactions, ...otherTransactions];
    
    // Update the store with the sorted merged transactions
    dispatch(setTransactions(sortedMergedTransactions));
    
    // Only load content for the new transactions to avoid redundant loading
    const transactionsToLoad = newTransactions.filter(
      newTx => !existingTransactionMap.has(newTx.id) || 
              (existingTransactionMap.has(newTx.id) && 
               !('content' in existingTransactionMap.get(newTx.id)!))
    );
    
    if (transactionsToLoad.length > 0) {
      await dispatch(loadContentForTransactions(transactionsToLoad));
    }
    
    return sortedMergedTransactions;
  }
); 