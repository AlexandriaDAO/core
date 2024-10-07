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

// Update the FETCH_BY_IDS_QUERY
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

// Update the FETCH_RECENT_QUERY to include owner information
const FETCH_RECENT_QUERY = gql`
  query RecentTransactionsWithContentType($tags: [TagFilter!], $first: Int!, $ingested_at: RangeFilter, $owners: [String!]) {
    transactions(
      tags: $tags
      first: $first
      sort: INGESTED_AT_DESC
      ingested_at: $ingested_at
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
          ingested_at
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

// Function to fetch transactions by IDs (for Bibliotheca)
export const fetchTransactionsByIds = async (ids: string[], contentType?: string, maxTimestamp?: number): Promise<Transaction[]> => {
  const uniqueIds = [...new Set(ids)]; // Remove duplicates
  const transactions: Transaction[] = [];

  try {
    const { data } = await arweaveNetClient.query({
      query: FETCH_BY_IDS_QUERY,
      variables: { ids: uniqueIds },
    });

    if (data && data.transactions && data.transactions.edges) {
      transactions.push(...data.transactions.edges
        .map((edge: any) => edge.node)
        .filter((tx: Transaction) => {
          if (contentType && !tx.tags.some(tag => tag.name === "Content-Type" && tag.value === contentType)) {
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

// Update fetchRecentTransactions function to include owner filter
export async function fetchRecentTransactions(
  contentType: string = "application/epub+zip", 
  amount: number = 10,
  maxTimestamp?: number,
  owner?: string
): Promise<Transaction[]> {
  try {
    const variables = { 
      tags: [{ name: "Content-Type", values: [contentType] }],
      first: Math.min(amount, 100),
      ingested_at: maxTimestamp ? { max: maxTimestamp } : undefined,
      owners: owner ? [owner] : undefined
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
      owner: edge.node.owner.address,
      tags: edge.node.tags,
      block: edge.node.block,
      data: edge.node.data,
      ingested_at: edge.node.ingested_at
    }));
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw error;
  }
}