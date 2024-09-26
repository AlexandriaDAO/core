import { ApolloClient, ApolloQueryResult, InMemoryCache, gql } from '@apollo/client';
import { Transaction } from './types/queries';

const client = new ApolloClient({
  uri: 'https://arweave-search.goldsky.com/graphql',
  cache: new InMemoryCache()
});

const QUERY = gql`
  query RecentTransactionsWithContentType($contentType: String!, $first: Int!) {
    transactions(
      tags: [
        { name: "Content-Type", values: [$contentType] }
      ]
      first: $first
      sort: HEIGHT_DESC
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

export async function fetchTransactions(contentType: string = "application/epub+zip", amount: number = 10): Promise<Transaction[]> {
  console.log(`Fetching ${amount} transactions with content type: ${contentType}`);
  try {
    const result = await client.query({ 
      query: QUERY,
      variables: { 
        contentType: contentType,
        first: Math.min(amount, 100)
      }
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

export async function getQuery(contentType: string = "application/epub+zip", amount: number = 10): Promise<ApolloQueryResult<any>> {
  try {
    const query = await client.query({ 
      query: QUERY,
      variables: { 
        contentType: contentType,
        first: Math.min(amount, 100) // Ensure we don't exceed 100
      }
    });
    return query;
  } catch (error) {
    console.error('Error getting query results:', error);
    throw error;
  }
}


