import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  setTransactions,
  clearTransactions,
  setMintableStates,
  setContentData,
  MintableStateItem,
} from "./contentDisplaySlice";
import {
  fetchTransactionsApi,
  fetchTransactionsForAlexandrian,
} from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { ContentService } from "@/apps/Modules/LibModules/contentDisplay/services/contentService";
import { Transaction } from "../../../shared/types/queries";
import {
  getActorUserAssetCanister,
  getAuthClient,
} from "@/features/auth/utils/authUtils";
import { RootState } from "@/store";
import { fetchAssetFromUserCanister } from "../assetManager/assetManagerThunks";

export const loadContentForTransactions = createAsyncThunk(
  "contentDisplay/loadContent",
  async (transactions: Transaction[], { dispatch }) => {
    const client = await getAuthClient();
    const initialStates = ContentService.getInitialMintableStates(transactions);
    dispatch(setMintableStates(initialStates));

    // Load content for each transaction
    await Promise.all(
      transactions.map(async (transaction) => {
        try {
          const content = await ContentService.loadContent(transaction);
          const urls = await ContentService.getContentUrls(
            transaction,
            content
          );

          // Combine content and urls into a single dispatch
          dispatch(
            setContentData({
              id: transaction.id,
              content: {
                ...content,
                urls,
              },
            })
          );

          if (content.error) {
            dispatch(
              setMintableStates({ [transaction.id]: { mintable: false } })
            );
          }
        } catch (error) {
          console.error("Error loading content:", error);
        }
      })
    );
  }
);

export const updateTransactions = createAsyncThunk(
  "contentDisplay/updateTransactions",
  async (arweaveIds: string[], { dispatch, getState }) => {
    try {
      let fetchedTransactions: Transaction[] = []; 
      if (arweaveIds.length === 0) {
        dispatch(setTransactions([]));
        return;
      }

      const state = getState() as RootState;
      const sortAsc = state.library.sortAsc;
      const userAssetCanister = state.assetManager.userAssetCanister;
      if (userAssetCanister) {
        const assetActor = await getActorUserAssetCanister(userAssetCanister);
        const getContentData = await fetchAssetFromUserCanister(
          "ContentData",
          assetActor
        );
      
        if (getContentData?.blob) {
          // Convert Blob to JSON
          const blobData = await getContentData.blob.arrayBuffer(); // Convert Blob to ArrayBuffer
          const textData = new TextDecoder().decode(blobData); // Decode to text
          try {
            const jsonData = JSON.parse(textData); // Convert to JSON
             fetchedTransactions=jsonData;
            console.log("JSON Data:", jsonData);
          } catch (error) {
            console.error("Failed to parse JSON:", error);
          }
        } else {
          console.warn("No data found in ContentData.");
        }
      }
      
      // Use the direct Arweave client for Alexandrian app

    // / const fetchedTransactions://await fetchTransactionsForAlexandrian(arweaveIds);

      // Apply sorting based on sortAsc
      const sortedTransactions = sortAsc
        ? fetchedTransactions
        : [...fetchedTransactions].reverse();

      dispatch(setTransactions(sortedTransactions));

      // Set initial mintable state for new transactions
      const newMintableStates = fetchedTransactions.reduce(
        (acc, transaction) => {
          acc[transaction.id] = { mintable: false };
          return acc;
        },
        {} as Record<string, MintableStateItem>
      );
      dispatch(setMintableStates(newMintableStates));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
);

export const clearAllTransactions = createAsyncThunk(
  "contentDisplay/clearAllTransactions",
  async (_, { dispatch }) => {
    dispatch(clearTransactions());
    dispatch(setMintableStates({}));
    ContentService.clearCache();
  }
);
