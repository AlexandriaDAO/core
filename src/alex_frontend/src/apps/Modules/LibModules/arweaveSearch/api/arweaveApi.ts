import { Transaction } from '../../../shared/types/queries';
import { fetchTransactions } from './arweaveClient';
import { getBlockHeightForTimestamp } from './arweaveHelpers';

export const fetchTransactionsApi = async (
  params: {
    nftIds?: string[];
    contentTypes?: string[];
    amount?: number;
    maxTimestamp?: number;
    ownerFilter?: string;
  }
): Promise<Transaction[]> => {
  try {
    const { nftIds, contentTypes, amount, maxTimestamp, ownerFilter } = params;

    let minBlock: number | undefined;
    let maxBlock: number | undefined;

    if (maxTimestamp) {
      try {
        maxBlock = await getBlockHeightForTimestamp(maxTimestamp);
        minBlock = Math.max(0, maxBlock - 500000);
      } catch (error) {
        console.error('Error getting block height for timestamp:', error);
      }
    }

    // If we have nftIds, process them in batches
    if (nftIds && nftIds.length > 0) {
      const BATCH_SIZE = 10;
      const allResults: Transaction[] = [];
      
      for (let i = 0; i < nftIds.length; i += BATCH_SIZE) {
        const batch = nftIds.slice(i, i + BATCH_SIZE);
        const results = await fetchTransactions(
          batch, 
          contentTypes, 
          undefined, 
          maxTimestamp, 
          ownerFilter, 
          minBlock, 
          maxBlock
        );
        allResults.push(...results);
      }

      return allResults;
    }

    // If no nftIds, proceed with normal fetch
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
    console.error('Error in fetchTransactionsApi:', error);
    return [];
  }
};