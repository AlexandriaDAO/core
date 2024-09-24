import { ApolloClient, ApolloQueryResult, InMemoryCache, gql } from '@apollo/client';

export interface Tag {
  name: string;
  value: string;
}

export interface Transaction {
  id: string;
  tags: Tag[];
  address: string;
  timestamp: number;
}

const client = new ApolloClient({
  uri: 'https://arweave.mainnet.irys.xyz/graphql',
  cache: new InMemoryCache()
});

const APP_ID = process.env.DFX_NETWORK === "ic" ? "testingAlexandria" : "UncensoredGreats";

export async function fetchTransactions(): Promise<Transaction[]> {
  console.log("Fetching transactions with APP_ID:", APP_ID);
  try {
    const result = await client.query({
      query: gql`
      query {
        transactions(
          first: 100,
          tags: [
            { name: "Content-Type", values: ["application/epub+zip"] },
            { name: "application-id", values: ["${APP_ID}"] },
          ]
        ) {
          edges {
            node {
              id
              tags {
                name
                value
              }
              address
              timestamp
            }
          }
        }
      }
      `
    });
    
    console.log("GraphQL query result:", result);

    if (!result.data || !result.data.transactions || !result.data.transactions.edges) {
      console.error("Unexpected response structure:", result);
      return [];
    }

    const filteredTransactions = result.data.transactions.edges.map((edge: any) => ({
      id: edge.node.id,
      tags: edge.node.tags,
      address: edge.node.address,
      timestamp: edge.node.timestamp
    }));
    
    console.log("Filtered transactions:", filteredTransactions);
    return filteredTransactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

export async function getQuery(): Promise<ApolloQueryResult<any>> {
  console.log("DFX_NETWORK:", process.env.DFX_NETWORK);
  console.log("APP_ID: ", APP_ID);
  try {
    const query = await client.query({
      query: gql`
        query {
          transactions(
            first: 100,
            tags: [
              { name: "Content-Type", values: ["application/epub+zip"] },
              { name: "application-id", values: ["${APP_ID}"] },
            ]
          ) {
            edges {
              node {
                id
                tags {
                  name
                  value
                }
                address
                timestamp
              }
            }
          }
        }
      `
    });
    console.log("getQuery result:", query);
    return query;
  } catch (error) {
    console.error('Error getting query results:', error);
    throw error;
  }
}


