import { Transaction } from "../../../shared/types/queries";
import { fetchTransactions } from "./arweaveClient";
import { fetchTransactionsByIds } from "./directArweaveClient";

export const fetchTransactionsApi = async (params: {
  nftIds?: string[];
  contentTypes?: string[];
  amount?: number;
  ownerFilter?: string;
  after?: string;
}): Promise<Transaction[]> => {
  try {
    const { nftIds, contentTypes, amount, ownerFilter, after } = params;

    console.log('ArweaveAPI - Processing request:', {
      params,
      after
    });

    // If nftIds are provided, fetch transactions for each ID in parallel
    if (nftIds && nftIds.length > 0) {
      const transactionPromises = nftIds.map((nftId) =>
        fetchTransactions(
          [nftId],
          contentTypes,
          undefined,
          ownerFilter,
          after
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
      after
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
