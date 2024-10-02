import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { Transaction } from './types/queries';

// Create two separate clients for different endpoints
const arweaveNetClient = new ApolloClient({
  uri: 'https://arweave.net/graphql',
  cache: new InMemoryCache()
});

const goldSkyClient = new ApolloClient({
  uri: 'https://arweave-search.goldsky.com/graphql',
  cache: new InMemoryCache()
});

// Query for fetching transactions by IDs (used by Bibliotheca)
const FETCH_BY_IDS_QUERY = gql`
  query GetTransactions($ids: [ID!]!) {
    transactions(ids: $ids, first: 1000) {
      edges {
        node {
          id
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

// Query for fetching recent transactions (used by Permahunt)
const FETCH_RECENT_QUERY = gql`
  query RecentTransactionsWithContentType($contentType: String!, $first: Int!, $maxHeight: Int) {
    transactions(
      tags: [
        { name: "Content-Type", values: [$contentType] }
      ]
      first: $first
      sort: HEIGHT_DESC
      block: {
        max: $maxHeight
      }
    ) {
      edges {
        node {
          id
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

// Helper function to estimate block height from timestamp
const estimateBlockHeight = (timestamp: number) => {
  const arweaveGenesisTimestamp = 1598280000; // 2020-08-24 14:00:00 UTC
  const averageBlockTime = 120; // 2 minutes in seconds
  return Math.floor((timestamp - arweaveGenesisTimestamp) / averageBlockTime);
};

// Function to fetch transactions by IDs (for Bibliotheca)
export async function fetchTransactionsByIds(ids: string[]): Promise<Transaction[]> {
  try {
    const result = await arweaveNetClient.query({
      query: FETCH_BY_IDS_QUERY,
      variables: { ids }
    });

    if (!result.data || !result.data.transactions || !result.data.transactions.edges) {
      console.error("Unexpected response structure:", result);
      return [];
    }

    const transactions: Transaction[] = result.data.transactions.edges.map((edge: any) => ({
      id: edge.node.id,
      tags: edge.node.tags,
      block: edge.node.block,
      data: edge.node.data
    }));

    console.log(`Fetched ${transactions.length} out of ${ids.length} transactions`);

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// Function to fetch recent transactions (for Permahunt)
export async function fetchRecentTransactions(
  contentType: string = "application/epub+zip", 
  amount: number = 10,
  maxTimestamp?: number
): Promise<Transaction[]> {
  try {
    const variables = { 
      contentType: contentType,
      first: Math.min(amount, 100),
      maxHeight: maxTimestamp ? estimateBlockHeight(maxTimestamp) : undefined
    };

    console.log("GraphQL query variables:", variables);

    const result = await goldSkyClient.query({ 
      query: FETCH_RECENT_QUERY,
      variables: variables
    });
    
    if (!result.data || !result.data.transactions || !result.data.transactions.edges) {
      console.error("Unexpected response structure:", result);
      return [];
    }

    return result.data.transactions.edges.map((edge: any) => ({
      id: edge.node.id,
      tags: edge.node.tags,
      block: edge.node.block,
      data: edge.node.data
    }));
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw error;
  }
}