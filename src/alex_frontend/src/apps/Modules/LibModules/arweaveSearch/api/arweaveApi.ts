import { Transaction } from "../../../shared/types/queries";
import { fetchTransactions } from "./arweaveClient";
import { getBlockHeightForTimestamp } from "./arweaveHelpers";

export const fetchTransactionsApi = async (params: {
  nftIds?: string[];
  contentTypes?: string[];
  amount?: number;
  maxTimestamp?: number;
  ownerFilter?: string;
}): Promise<Transaction[]> => {
  try {
    const { nftIds, contentTypes, amount, maxTimestamp, ownerFilter } = params;

    let minBlock: number | undefined;
    let maxBlock: number | undefined;

    // Calculate block range based on maxTimestamp if provided
    if (maxTimestamp) {
      try {
        maxBlock = await getBlockHeightForTimestamp(maxTimestamp);
        minBlock = Math.max(0, maxBlock - 500000);
      } catch (error) {
        console.error("Error getting block height for timestamp:", error);
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
