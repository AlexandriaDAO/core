/**
 * Unified transaction thunks that replace both contentDisplayThunks and nftTransactionsThunks
 */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getTransactionService } from "../../../shared/services/transactionService";
import { AppDispatch, RootState } from "@/store";
import { Transaction } from "../../../shared/types/queries";
import { fetchTransactionsForAlexandrian } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { setTransactions } from "./transactionSlice";
import { getAssetCanister } from "../assetManager/utlis";
import {
  getActorUserAssetCanister,
  getAuthClient,
} from "@/features/auth/utils/authUtils";
import { fetchAssetFromUserCanister } from "../assetManager/assetManagerThunks";

/**
 * Fetch transactions for NFTs
 */
export const fetchNftTransactions = createAsyncThunk<
  Transaction[],
  string[],
  { dispatch: AppDispatch; state: RootState }
>(
  "transactions/fetchNftTransactions",
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
  string[],
  { dispatch: AppDispatch; state: RootState }
>(
  "transactions/updateTransactions",
  async (arweaveIds: string[], { dispatch, getState }) => {
    const state = getState() as RootState;
    const { selectedPrincipals } = state.library;
    const existingTransactions = state.transactions.transactions;
    const nfts = state.nftData?.nfts || {};
    let userAssetCanisterd = await getAssetCanister(selectedPrincipals[0]);

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

    if (userAssetCanisterd) {
      const assetActor = await getActorUserAssetCanister(userAssetCanisterd);
      const getContentData = await fetchAssetFromUserCanister(
        "ContentData",
        assetActor
      );

      if (getContentData?.blob) {
        try {
          const blobData = await getContentData.blob.arrayBuffer();
          const textData = new TextDecoder().decode(blobData);
          const jsonData = JSON.parse(textData);

          let transactions = Array.isArray(jsonData) ? jsonData : [jsonData];
          transactions = transactions.filter((tx) =>
            arweaveIds.includes(tx.id)
          );

          const fetchPromises = transactions.map(async (transaction) => {
            try {
              const result = await fetchAssetFromUserCanister(
                transaction.id,
                assetActor
              );

              const assetUrl = result?.blob
                ? URL.createObjectURL(result.blob)
                : "";

              return { id: transaction.id, assetUrl };
            } catch (error) {
              console.error(
                `Failed to fetch asset for transaction ${transaction.id}:`,
                error
              );
              return { id: transaction.id, assetUrl: "" };
            }
          });

          const assetResults = await Promise.all(fetchPromises);

          requestedTransactions = requestedTransactions.map((tx) => {
            const found = assetResults.find((a) => a.id === tx.id);
            return found ? { ...tx, assetUrl: found.assetUrl } : tx;
          });
        } catch (error) {
          console.error("Failed to process data:", error);
        }
      } else {
        console.warn("No data found in ContentData.");
      }
    }

    console.log("Final Transactions:", requestedTransactions);
    // dispatch(setTransactions(sortedMergedTransactions));
  
       dispatch(setTransactions([])); // is not effecting the code sill displaying nfts 


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
