import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  setTransactions,
  clearTransactions,
  setMintableStates,
  setContentData,
  MintableStateItem,
  addTransaction,
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
            try {
              // Convert Blob to JSON
              const blobData = await getContentData.blob.arrayBuffer();
              const textData = new TextDecoder().decode(blobData);
              const jsonData = JSON.parse(textData);
          
              // Assuming jsonData is an array of transactions with 'id' property
              // If it's not an array, wrap it in an array
              const transactions = Array.isArray(jsonData) ? jsonData : [jsonData];
          
              // Create an array of promises for fetching assets
              // const fetchPromises = transactions.map(async (transaction) => {
              //   try {
              //     const result = await fetchAssetFromUserCanister(
              //       transaction.id,
              //       assetActor
              //     );
                  
              //     // Create object URL if blob exists
              //     const assetUrl = result?.blob ? URL.createObjectURL(result.blob) : "";
                  
              //     // Return a new object with all existing properties plus the asset URL
              //     return {
              //       ...transaction,
              //       assetUrl
              //     };
              //   } catch (error) {
              //     console.error(`Failed to fetch asset for transaction ${transaction.id}:`, error);
              //     // Return original transaction without URL if fetch fails
              //     return {
              //       ...transaction,
              //       assetUrl: ""
              //     };
              //   }
              // });
              const fetchPromises = transactions.map(async (transaction) => {
                try {
                  const result = await fetchAssetFromUserCanister(
                    transaction.id,
                    assetActor
                  );
                  
                  // Create object URL if blob exists
                  const assetUrl = result?.blob ? URL.createObjectURL(result.blob) : "";
                  
                  // Dispatch immediately for each transaction
                  dispatch(addTransaction({
                    ...transaction,
                    assetUrl
                  }));
                } catch (error) {
                  console.error(`Failed to fetch asset for transaction ${transaction.id}:`, error);
                  
                  // Dispatch with empty asset URL on error
                  dispatch(addTransaction({
                    ...transaction,
                    assetUrl: ""
                  }));
                }
              });
              console.log(`[${new Date().toISOString()}] Before promise ...:(`);
              // dispatch(addTransaction())
              // Wait for all fetch operations to complete
              const processedTransactions = await Promise.all(fetchPromises);
              console.log(`[${new Date().toISOString()}] After promise ...:(`);

              // Update fetchedTransactions with the processed data
              // fetchedTransactions = processedTransactions;
          
              console.log("Processed Transactions:", fetchedTransactions);
            } catch (error) {
              console.error("Failed to process data:", error);
              fetchedTransactions = [];
            }
          } else {
            console.warn("No data found in ContentData.");
            fetchedTransactions = [];
          }
        }
  
        // Use the direct Arweave client for Alexandrian app
  
        // / const fetchedTransactions://await fetchTransactionsForAlexandrian(arweaveIds);
  
        // Apply sorting based on sortAsc
        const sortedTransactions = sortAsc
          ? fetchedTransactions
          : [...fetchedTransactions].reverse();
  
       // dispatch(setTransactions(sortedTransactions));
  
        // Set initial mintable state for new transactions
        // const newMintableStates = fetchedTransactions.reduce(
        //   (acc, transaction) => {
        //     acc[transaction.id] = { mintable: false };
        //     return acc;
        //   },
        //   {} as Record<string, MintableStateItem>
        // );
        // dispatch(setMintableStates(newMintableStates));
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
