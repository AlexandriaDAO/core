import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  setTransactions,
  clearTransactions,
  setContentData,
  addTransaction,
} from "./contentDisplaySlice";
import {
  fetchTransactionsForAlexandrian,
} from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { ContentService } from "@/apps/Modules/LibModules/contentDisplay/services/contentService";
import { Transaction } from "../../../shared/types/queries";
import {
  getActorUserAssetCanister,
} from "@/features/auth/utils/authUtils";
import { RootState } from "@/store";
import { fetchAssetFromUserCanister } from "../assetManager/assetManagerThunks";
import { getAssetCanister } from "../assetManager/utlis";

// The problem with this Adil is that if one asset fails to load, all thereafter fail to load until page refresh. It's also not easy to debug.
// export const loadContentForTransactions = createAsyncThunk(
//   "contentDisplay/loadContent",
//   async (transactions: Transaction[], { dispatch }) => {

//     // Adil asset-canister version
//     await Promise.all(
//       transactions.map(async (transaction) => {
//         try {
//           const content = await ContentService.loadContent(transaction);
//           const urls = await ContentService.getContentUrls(
//             transaction,
//             content
//           );

//           // Combine content and urls into a single dispatch
//           dispatch(
//             setContentData({
//               id: transaction.id,
//               content: {
//                 ...content,
//                 urls,
//               },
//             })
//           );
//         } catch (error) {
//           console.error('Error loading content for transaction', transaction.id, ':', error);
//         }
//       })
//     );  
//   });


// Evan's versions, doesn't break all the rendering at once if one fails (but no batching).
export const loadContentForTransactions = createAsyncThunk(
  "contentDisplay/loadContent",
  async (transactions: Transaction[], { dispatch }) => {
    transactions.forEach(async (transaction) => {
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
      } catch (error) {
        console.error('Error loading content for transaction', transaction.id, ':', error);
      }
    });
  }
);

export const updateTransactions = createAsyncThunk(
  "contentDisplay/updateTransactions",
  async (arweaveIds: string[], { dispatch, getState }) => {
    try {
      dispatch(setTransactions([]));
      let fetchedTransactions: Transaction[] = [];
      if (arweaveIds.length === 0) {
        return;
      }

      const state = getState() as RootState;
      const sortAsc = state.library.sortAsc;
      const { selectedPrincipals } = state.library;
      const userAssetCanister = state.assetManager.userAssetCanister;
      let userAssetCanisterd = await getAssetCanister(selectedPrincipals[0]);
      
      // user asset Canister exists
      if (userAssetCanisterd) {
        const assetActor = await getActorUserAssetCanister(userAssetCanisterd);
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

            let transactions = Array.isArray(jsonData) ? jsonData : [jsonData];
            // Filter transactions that match the provided arweaveIds
            transactions = transactions.filter(
              (tx) => arweaveIds.includes(tx.id)
            );

            // Process transactions one by one to isolate failures
            transactions.forEach(async (transaction) => {
              try {
                const result = await fetchAssetFromUserCanister(
                  transaction.id,
                  assetActor
                );

                // Create object URL if blob exists
                const assetUrl = result?.blob
                  ? URL.createObjectURL(result.blob)
                  : "";

                // Dispatch immediately for each transaction
                dispatch(
                  addTransaction({
                    ...transaction,
                    assetUrl,
                  })
                );

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
              } catch (error) {
                console.error('Error processing transaction:', error);
                dispatch(
                  addTransaction({
                    ...transaction,
                    assetUrl: "",
                  })
                );
              }
            });
          } catch (error) {
            console.error("Failed to process data:", error);
            fetchedTransactions = [];
          }
        } else {
          console.warn("No data found in ContentData.");
          fetchedTransactions = [];
        }
      } else {
        // Use the direct Arweave client for Alexandrian app
        const fetchedTransactions = await fetchTransactionsForAlexandrian(
          arweaveIds
        );

        // Apply sorting based on sortAsc
        const sortedTransactions = sortAsc
          ? fetchedTransactions
          : [...fetchedTransactions].reverse();

        dispatch(setTransactions(sortedTransactions));
        
        // Load content for transactions
        dispatch(loadContentForTransactions(sortedTransactions));
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
);
