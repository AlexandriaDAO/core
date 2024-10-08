import { Transaction } from '../types/queries';
import { fetchRecentTransactions, fetchTransactionsByIds } from './arweaveClient';
import { getBlockHeightForTimestamp } from './arweaveHelpers';

export const fetchTransactions = async (
  params: {
    userTransactionIds?: string[];
    contentTypes?: string[];
    amount?: number;
    maxTimestamp?: number;
    ownerFilter?: string;
  }
): Promise<Transaction[]> => {
  const { userTransactionIds, contentTypes, amount, maxTimestamp, ownerFilter } = params;

  let minBlock: number | undefined;
  let maxBlock: number | undefined;

  if (maxTimestamp) {
    maxBlock = await getBlockHeightForTimestamp(maxTimestamp);
    minBlock = Math.max(0, maxBlock - 50000);
  }

  if (userTransactionIds && userTransactionIds.length > 0) {
    return fetchTransactionsByIds(userTransactionIds, contentTypes, maxTimestamp);
  } else {
    return fetchRecentTransactions(contentTypes, amount, maxTimestamp, ownerFilter, minBlock, maxBlock);
  }
};