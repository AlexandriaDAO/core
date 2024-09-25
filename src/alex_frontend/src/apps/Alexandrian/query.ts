import { ApolloClient, ApolloQueryResult, InMemoryCache, gql } from '@apollo/client';

export interface Tag {
  name: string;
  value: string;
}

export interface Transaction {
  id: string;
  tags: Tag[];
  block: {
    height: number;
    timestamp: number;
  };
  data: {
    size: number;
    type: string;
  };
}

const client = new ApolloClient({
  uri: 'https://arweave-search.goldsky.com/graphql',
  cache: new InMemoryCache()
});

const QUERY = gql`
  query RecentTransactionsWithContentType {
    transactions(
      tags: [
        { name: "Content-Type", values: ["application/epub+zip"] }
      ]
      first: 100
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

export async function fetchTransactions(): Promise<Transaction[]> {
  console.log("Fetching transactions");
  try {
    const result = await client.query({ query: QUERY });
    
    console.log("GraphQL query result:", result);

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
    
    console.log("Filtered transactions:", transactions);
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

export async function getQuery(): Promise<ApolloQueryResult<any>> {
  try {
    const query = await client.query({ query: QUERY });
    console.log("getQuery result:", query);
    return query;
  } catch (error) {
    console.error('Error getting query results:', error);
    throw error;
  }
}


