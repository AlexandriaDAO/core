import axios from 'axios';
import { Transaction } from '../../../shared/types/queries';
import { ARWEAVE_CONFIG } from '../config/arweaveConfig';

interface ArweaveTag {
  name: string;
  value: string;
}

const GRAPHQL_QUERY = `
query GetTransactions($ids: [ID!]!, $first: Int!) {
  transactions(ids: $ids, first: $first) {
    edges {
      node {
        id
        owner { address }
        tags {
          name
          value
        }
        block {
          height
          timestamp
        }
        data {
          size
          type
        }
      }
    }
  }
}`;

export async function fetchTransactionsByIds(txIds: string[]): Promise<Transaction[]> {
  try {
    const first = txIds.length;
    
    const { data: graphqlResponse } = await axios.post(
      ARWEAVE_CONFIG.ARWEAVE_ENDPOINT,
      {
        query: GRAPHQL_QUERY,
        variables: { 
          ids: txIds,
          first: first
        }
      }
    );

    if (!graphqlResponse.data?.transactions?.edges) {
      console.error('No transactions found');
      return [];
    }

    return graphqlResponse.data.transactions.edges
      .map((edge: any) => {
        const tx = edge.node;
        return {
          id: tx.id,
          owner: tx.owner.address,
          tags: tx.tags,
          block: tx.block,
          data: tx.data
        };
      })
      .filter((tx: Transaction | null): tx is Transaction => tx !== null);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function fetchTransactionById(txId: string): Promise<Transaction | null> {
  const transactions = await fetchTransactionsByIds([txId]);
  return transactions[0] || null;
} 