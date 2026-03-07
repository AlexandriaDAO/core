/**
 * Unified transaction thunks that replace both contentDisplayThunks and nftTransactionsThunks
 */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getTransactionService } from "../../../shared/services/transactionService";
import { AppDispatch, RootState } from "@/store";
import { Transaction } from "../../../shared/types/queries";
import { fetchTransactionsForAlexandrian } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { setTransactions } from "./transactionSlice";

/**
 * Fetch transactions for NFTs
 */
export const fetchNftTransactions = createAsyncThunk<
  Transaction[],
  {arweaveIds: string[]},
  { dispatch: AppDispatch; state: RootState }
>(
  "transactions/fetchNftTransactions",
  async ({arweaveIds}, { dispatch, getState }) => {
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
  "transactions/fetchPermasearchTransactions",
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
  "transactions/loadContentForTransactions",
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
>("transactions/clearAllTransactions", async (_, { dispatch, getState }) => {
  const transactionService = getTransactionService(dispatch, getState);
  transactionService.clearAll();
});

/**
 * Add a transaction
 */
export const addTransaction = createAsyncThunk<
  void,
  Transaction,
  { dispatch: AppDispatch; state: RootState }
>(
  "transactions/addTransaction",
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
>("transactions/removeTransaction", async (id, { dispatch, getState }) => {
  const transactionService = getTransactionService(dispatch, getState);
  transactionService.removeTransaction(id);
});

/**
 * Update transactions based on arweave IDs
 */
export const updateTransactions = createAsyncThunk<
  Transaction[],
  {arweaveIds: string[]},
  { dispatch: AppDispatch; state: RootState }
>(
  "transactions/updateTransactions",
  async ({arweaveIds}, { dispatch, getState }) => {
    const state = getState() as RootState;
    const existingTransactions = state.transactions.transactions;
    const nfts = state.nftData?.nfts || {};

    if (arweaveIds.length === 0) {
      return existingTransactions;
    }

    const newTransactions = await fetchTransactionsForAlexandrian(arweaveIds);

    const existingTransactionMap = new Map(
      existingTransactions.map((tx) => [tx.id, tx])
    );

    const arweaveIdOrderMap = new Map(
      arweaveIds.map((id, index) => [id, index])
    );

    const nftOrderMap = new Map();
    Object.values(nfts).forEach((nft) => {
      if (nft.orderIndex !== undefined && arweaveIds.includes(nft.arweaveId)) {
        nftOrderMap.set(nft.arweaveId, nft.orderIndex);
      }
    });

    const mergedTransactions = [
      ...existingTransactions.filter((tx) => !arweaveIds.includes(tx.id)),
      ...newTransactions.map((newTx) =>
        existingTransactionMap.has(newTx.id)
          ? existingTransactionMap.get(newTx.id)!
          : newTx
      ),
    ];

    let requestedTransactions = mergedTransactions.filter((tx) =>
      arweaveIds.includes(tx.id)
    );
    const otherTransactions = mergedTransactions.filter(
      (tx) => !arweaveIds.includes(tx.id)
    );

    requestedTransactions.sort((a, b) => {
      const aOrderFromNft = nftOrderMap.get(a.id);
      const bOrderFromNft = nftOrderMap.get(b.id);

      if (aOrderFromNft !== undefined && bOrderFromNft !== undefined) {
        return aOrderFromNft - bOrderFromNft;
      }

      const aOrder = arweaveIdOrderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = arweaveIdOrderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });

    const sortedMergedTransactions = [
      ...requestedTransactions,
      ...otherTransactions,
    ];

    console.log("Final Transactions:", requestedTransactions);
    dispatch(setTransactions([]));

    const transactionsToLoad = newTransactions.filter(
      (newTx) =>
        !existingTransactionMap.has(newTx.id) ||
        (existingTransactionMap.has(newTx.id) &&
          !("content" in existingTransactionMap.get(newTx.id)!))
    );

    if (transactionsToLoad.length > 0) {
      await dispatch(loadContentForTransactions(transactionsToLoad));
    }

    return sortedMergedTransactions;
  }
);
