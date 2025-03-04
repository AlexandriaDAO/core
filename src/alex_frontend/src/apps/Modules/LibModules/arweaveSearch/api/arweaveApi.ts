import { Transaction } from "../../../shared/types/queries";
import { fetchTransactions } from "./arweaveClient";
import { fetchTransactionsByIds } from "./directArweaveClient";
import { getBlockHeightForTimestamp } from "./arweaveHelpers";

export const fetchTransactionsApi = async (params: {
  nftIds?: string[];
  contentTypes?: string[];
  amount?: number;
  ownerFilter?: string;
  after?: string;
  timestamp?: number;
}): Promise<Transaction[]> => {
  try {
    const { nftIds, contentTypes, amount, ownerFilter, after, timestamp } = params;

    console.log('ArweaveAPI - Processing request:', {
      params,
      timestamp: timestamp ? new Date(timestamp).toISOString() : undefined,
      after
    });

    let minBlock: number | undefined;
    let maxBlock: number | undefined;

    // Convert milliseconds to seconds and ensure it's a valid number
    if (timestamp && !isNaN(timestamp)) {
      const maxTimestamp = Math.floor(timestamp / 1000);
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
        throw error;
      }
    }

    // If nftIds are provided, fetch transactions for each ID in parallel
    if (nftIds && nftIds.length > 0) {
      const transactionPromises = nftIds.map((nftId) =>
        fetchTransactions(
          [nftId],
          contentTypes,
          undefined,
          ownerFilter,
          after,
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
      ownerFilter,
      after,
      minBlock,
      maxBlock
    );
  } catch (error) {
    console.error("Error in fetchTransactionsApi:", error);
    return [];
  }
};

export const fetchTransactionsForAlexandrian = async (nftIds: string[]): Promise<Transaction[]> => {
  try {
    if (!nftIds || nftIds.length === 0) {
      return [];
    }

    // Use directArweaveClient to fetch transactions
    return await fetchTransactionsByIds(nftIds);
  } catch (error) {
    console.error("Error in fetchTransactionsForAlexandrian:", error);
    return [];
  }
};
