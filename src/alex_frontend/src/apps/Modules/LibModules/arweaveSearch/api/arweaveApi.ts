import { Transaction } from "../../../shared/types/queries";
import { fetchTransactions } from "./arweaveClient";
import { getBlockHeightForTimestamp } from "./arweaveHelpers";

export const fetchTransactionsApi = async (params: {
  nftIds?: string[];
  contentTypes?: string[];
  amount?: number;
  timestamp?: number;
  ownerFilter?: string;
}): Promise<Transaction[]> => {
  try {
    const { nftIds, contentTypes, amount, timestamp, ownerFilter } = params;

    let minBlock: number | undefined;
    let maxBlock: number | undefined;

    // Convert milliseconds to seconds and ensure it's a valid number
    const maxTimestamp = timestamp && !isNaN(timestamp) 
      ? Math.floor(timestamp / 1000) 
      : Math.floor(Date.now() / 1000);

    console.log('ArweaveAPI - Processing request:', {
      timestamp,
      maxTimestamp,
      params,
      date: new Date(timestamp || Date.now()).toISOString()
    });

    if (maxTimestamp) {
      try {
        maxBlock = await getBlockHeightForTimestamp(maxTimestamp);
        // Adjust the block range to be more reasonable
        minBlock = Math.max(0, maxBlock - 50000); // Reduced from 500000 to 50000
        
        console.log('ArweaveAPI - Block range:', {
          maxBlock,
          minBlock,
          maxTimestamp,
          date: new Date(maxTimestamp * 1000).toISOString()
        });
      } catch (error) {
        console.error("Error getting block height for timestamp:", error);
        throw error; // Propagate the error instead of silently continuing
      }
    }

    // If nftIds are provided, fetch transactions for each ID in parallel
    if (nftIds && nftIds.length > 0) {
      const transactionPromises = nftIds.map((nftId) =>
        fetchTransactions(
          [nftId], // Fetch transactions for each individual nftId
          contentTypes,
          undefined,
          maxTimestamp,
          ownerFilter,
          minBlock,
          maxBlock
        )
      );

      // Wait for all transaction fetches to complete
      const results = await Promise.all(transactionPromises);
      return results.flat();

    }

    // If no NFT IDs are provided, fetch transactions normally
    return await fetchTransactions(
      nftIds,
      contentTypes,
      amount,
      maxTimestamp,
      ownerFilter,
      minBlock,
      maxBlock
    );
  } catch (error) {
    console.error("Error in fetchTransactionsApi:", error);
    return [];
  }
};
