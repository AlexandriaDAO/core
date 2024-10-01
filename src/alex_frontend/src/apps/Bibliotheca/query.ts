import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { Transaction } from '../helpers/ArWeave/types/queries';

const client = new ApolloClient({
  uri: 'https://arweave-search.goldsky.com/graphql',
  cache: new InMemoryCache()
});

const QUERY = gql`
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

// Estimate block height from timestamp
// Arweave aims for 2-minute block times, but it's not exact
const estimateBlockHeight = (timestamp: number) => {
  const arweaveGenesisTimestamp = 1598280000; // 2020-08-24 14:00:00 UTC
  const averageBlockTime = 120; // 2 minutes in seconds
  return Math.floor((timestamp - arweaveGenesisTimestamp) / averageBlockTime);
};

export async function fetchTransactions(
  contentType: string = "application/epub+zip", 
  amount: number = 10,
  minTimestamp?: number,
  maxTimestamp?: number
): Promise<Transaction[]> {
  try {
    const variables = { 
      contentType: contentType,
      first: Math.min(amount, 100),
      maxHeight: maxTimestamp ? estimateBlockHeight(maxTimestamp) : undefined
    };

    console.log("GraphQL query variables:", variables);

    const result = await client.query({ 
      query: QUERY,
      variables: variables
    });
    
    if (!result.data || !result.data.transactions || !result.data.transactions.edges) {
      console.error("Unexpected response structure:", result);
      return [];
    }

    const transactions = result.data.transactions.edges.map((edge: any) => ({
      id: edge.node.id,
      tags: edge.node.tags,
      block: edge.node.block,
      data: edge.node.data
    }));
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

