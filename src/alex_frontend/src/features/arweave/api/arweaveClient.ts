import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { ApolloLink } from '@apollo/client/link/core';
import { Transaction } from '../types/queries';
import { getBlockHeightForTimestamp } from './arweaveHelpers';
import axios from 'axios';
import { ARWEAVE_CONFIG, getArweaveUrl } from '../config/arweaveConfig';

const logLink = new ApolloLink((operation, forward) => {
  console.log('GraphQL Request:', {
    operationName: operation.operationName,
    query: operation.query.loc?.source.body,
    variables: operation.variables,
  });
  return forward(operation);
});

const httpLink = new HttpLink({
  uri: ARWEAVE_CONFIG.GRAPHQL_ENDPOINT,
});

const arweaveNetClient = new ApolloClient({
  link: ApolloLink.from([logLink, httpLink]),
  cache: new InMemoryCache(),
});

const FETCH_RECENT_QUERY = gql`
  query RecentTransactions($tags: [TagFilter!], $first: Int!, $after: String, $minBlock: Int, $maxBlock: Int, $owners: [String!]) {
    transactions(
      tags: $tags,
      first: $first,
      after: $after,
      block: { min: $minBlock, max: $maxBlock },
      owners: $owners
    ) {
      edges {
        cursor
        node {
          id
          owner {
            address
          }
          block {
            height
            timestamp
          }
          tags {
            name
            value
          }
          data {
            size
            type
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

// Update FETCH_BY_IDS_QUERY for Goldsky endpoint
const FETCH_BY_IDS_QUERY = gql`
  query FetchTransactionsByIds($ids: [ID!]!) {
    transactions(ids: $ids) {
      edges {
        node {
          id
          owner {
            address
          }
          block {
            height
            timestamp
          }
          tags {
            name
            value
          }
          data {
            size
            type
          }
        }
      }
    }
  }
`;

// Function to fetch transactions by IDs (for Bibliotheca)
export const fetchTransactionsByIds = async (
  ids: string[],
  contentTypes?: string[],
  maxTimestamp?: number
): Promise<Transaction[]> => {
  const uniqueIds = [...new Set(ids)]; // Remove duplicates
  const transactions: Transaction[] = [];

  console.log('Fetching transactions by IDs:', uniqueIds);

  try {
    const { data } = await arweaveNetClient.query({
      query: FETCH_BY_IDS_QUERY,
      variables: { ids: uniqueIds },
    });

    if (data && data.transactions && data.transactions.edges) {
      transactions.push(
        ...data.transactions.edges
          .map((edge: any) => ({
            id: edge.node.id,
            owner: edge.node.owner.address,
            tags: edge.node.tags,
            block: edge.node.block,
            data: edge.node.data,
          }))
          .filter((tx: Transaction) => {
            if (
              contentTypes &&
              !tx.tags.some(
                (tag) => tag.name === 'Content-Type' && contentTypes.includes(tag.value)
              )
            ) {
              return false;
            }
            if (maxTimestamp && tx.block && tx.block.timestamp > maxTimestamp) {
              return false;
            }
            return true;
          })
      );
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }

  console.log(`Fetched ${transactions.length} out of ${uniqueIds.length} transactions`);
  return transactions;
};

// Update fetchRecentTransactions function
export async function fetchRecentTransactions(
  contentTypes?: string[],
  amount?: number,
  maxTimestamp?: number,
  owner?: string,
  minBlock?: number,
  maxBlock?: number
): Promise<Transaction[]> {
  try {
    const pageSize = 100;
    let allTransactions: Transaction[] = [];
    let hasNextPage = true;
    let afterCursor: string | null = null;

    // If minBlock and maxBlock are provided, use them; otherwise, compute defaults
    if (minBlock === undefined || maxBlock === undefined) {
      // Fetch current network info to get the max block height
      const { data: networkInfo } = await axios.get(getArweaveUrl('info'));
      const currentBlockHeight = parseInt(networkInfo.height, 10);
      
      if (maxTimestamp) {
        maxBlock = await getBlockHeightForTimestamp(maxTimestamp);
      } else {
        maxBlock = currentBlockHeight;
      }
      
      // Default minBlock to a range of recent blocks if not provided
      minBlock = Math.max(0, maxBlock - 50000);
    }

    while (hasNextPage && (!amount || allTransactions.length < amount)) {
      const tags: any[] = [];
      if (contentTypes && contentTypes.length > 0) {
        tags.push({ name: 'Content-Type', values: contentTypes });
      }

      const variables: any = {
        first: Math.min(pageSize, amount ? amount - allTransactions.length : pageSize),
        after: afterCursor,
        tags: tags.length > 0 ? tags : undefined,
        minBlock: minBlock,
        maxBlock: maxBlock,
        owners: owner ? [owner] : undefined,
      };

      console.log('GraphQL query variables:', variables);

      const result = await arweaveNetClient.query({
        query: FETCH_RECENT_QUERY,
        variables: variables,
      });

      if (
        !result.data ||
        !result.data.transactions ||
        !result.data.transactions.edges
      ) {
        console.error('Unexpected response structure:', result);
        break;
      }

      const newTransactions = result.data.transactions.edges.map((edge: any) => ({
        id: edge.node.id,
        owner: edge.node.owner.address,
        tags: edge.node.tags,
        block: edge.node.block,
        data: edge.node.data,
      }));

      // Filter transactions by maxTimestamp if provided
      const filteredTransactions = newTransactions.filter((tx: Transaction) => {
        if (maxTimestamp && tx.block && tx.block.timestamp > maxTimestamp) {
          return false;
        }
        return true;
      });

      allTransactions = [...allTransactions, ...filteredTransactions];
      hasNextPage = result.data.transactions.pageInfo.hasNextPage;
      afterCursor =
        result.data.transactions.edges[
          result.data.transactions.edges.length - 1
        ]?.cursor || null;

      if (!hasNextPage || (amount && allTransactions.length >= amount)) {
        break;
      }
    }

    return allTransactions.slice(0, amount);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw error;
  }
}
