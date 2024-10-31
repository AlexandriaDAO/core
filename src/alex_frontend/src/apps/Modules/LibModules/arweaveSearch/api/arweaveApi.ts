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
  const { nftIds, contentTypes, amount, maxTimestamp, ownerFilter } = params;

  let minBlock: number | undefined;
  let maxBlock: number | undefined;

  if (maxTimestamp) {
    maxBlock = await getBlockHeightForTimestamp(maxTimestamp);
    minBlock = Math.max(0, maxBlock - 500000);
  }

  // If we have nftIds, process them in controlled batches
  if (nftIds && nftIds.length > 0) {
    const BATCH_SIZE = 10;  // Size of each API request
    const CONCURRENT_REQUESTS = 5;  // Number of concurrent requests
    const allResults: Transaction[] = [];
    
    // Process nftIds in chunks of (BATCH_SIZE * CONCURRENT_REQUESTS)
    for (let i = 0; i < nftIds.length; i += (BATCH_SIZE * CONCURRENT_REQUESTS)) {
      const chunk = nftIds.slice(i, i + (BATCH_SIZE * CONCURRENT_REQUESTS));
      const batches = [];
      
      // Split chunk into batches of BATCH_SIZE
      for (let j = 0; j < chunk.length; j += BATCH_SIZE) {
        const batch = chunk.slice(j, j + BATCH_SIZE);
        batches.push(batch);
      }

      // Process this chunk of batches concurrently
      console.log(`Processing batch ${i/(BATCH_SIZE * CONCURRENT_REQUESTS) + 1} of ${Math.ceil(nftIds.length/(BATCH_SIZE * CONCURRENT_REQUESTS))}`);
      
      const results = await Promise.all(
        batches.map(batch => 
          fetchTransactions(batch, contentTypes, undefined, maxTimestamp, ownerFilter, minBlock, maxBlock)
        )
      );

      allResults.push(...results.flat());
    }

    return allResults;
  }

  // If no nftIds, proceed with normal fetch
  return fetchTransactions(nftIds, contentTypes, amount, maxTimestamp, ownerFilter, minBlock, maxBlock);
};