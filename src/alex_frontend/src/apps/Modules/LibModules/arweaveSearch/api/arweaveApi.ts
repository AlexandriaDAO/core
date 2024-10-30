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

  return fetchTransactions(nftIds, contentTypes, amount, maxTimestamp, ownerFilter, minBlock, maxBlock);
};